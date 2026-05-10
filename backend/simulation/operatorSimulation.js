const Order = require('../models/Order');
const Stock = require('../models/Stock');
const Shipment = require('../models/Shipment');
const Supplier = require('../models/Supplier');
const Carrier = require('../models/Carrier');
const Log = require('../models/Log');

const CUSTOMERS = [
  { name: 'Dr. Evelyn Hayes', email: 'e.hayes@astratos.io', phone: '+1 555-0192' },
  { name: 'Marcus Chen', email: 'marcus.chen@nexus.corp', phone: '+1 555-0234' },
  { name: 'Sofia Petrov', email: 'sofia.p@orion-logistics.com', phone: '+44 20 7946 0111' },
  { name: 'James Nakamura', email: 'j.nakamura@atlas-tech.io', phone: '+81 3-5555-0198' },
  { name: 'Amara Osei', email: 'amara.osei@zenith.co', phone: '+233 55-987-6543' },
  { name: 'Nikolai Volkov', email: 'n.volkov@ares-ind.com', phone: '+7 495-555-0132' }
];

let currentWss = null;
let supplierQueue = []; // Shuffle-bag queue — random order, no consecutive repeats

const setSimulationWss = (wss) => {
  currentWss = wss;
};

const broadcast = (type, payload) => {
  if (!currentWss) return;
  currentWss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
};

const logAudit = async (action, user, item, details) => {
  try {
    // Write directly to MongoDB so all consumers (graph, audit trail, logs) see it
    await Log.create({
      type: action,
      user: user || 'system',
      message: item || '',
      details: details || ''
    });
  } catch (err) {
    console.error('logAudit failed:', err.message);
  }
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateAutoOrder = async () => {
  try {
    const stockItems = await Stock.find({ quantity: { $gt: 0 } });
    if (stockItems.length === 0) return;

    const batchSize = randomInt(1, 4); // Create 1-4 orders at once so the queue jumps visually

    for (let b = 0; b < batchSize; b++) {
        const customer = CUSTOMERS[randomInt(0, CUSTOMERS.length - 1)];
        const numItems = randomInt(1, 3);
        const items = [];
        
        for (let i = 0; i < numItems; i++) {
            const product = stockItems[randomInt(0, stockItems.length - 1)];
            const qty = randomInt(1, 5);
            if (product.quantity >= qty) {
                items.push({
                    product: product.name,
                    quantity: qty,
                    price: product.price,
                    stockRef: product._id
                });
                product.quantity -= qty;
                await product.save();
                
                broadcast('INVENTORY_UPDATE', { 
                  type: 'ORDER_DECREASE', 
                  item: product.name, 
                  quantity: product.quantity 
                });

                if (product.quantity <= 10) {
                  broadcast('NOTIFICATION', {
                    type: 'LOW_STOCK',
                    message: `Low stock on ${product.name} (${product.quantity} left).`
                  });
                }
            }
        }

        if (items.length === 0) continue;

        const totalAmount = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
        const order = await Order.create({
          customer,
          items,
          status: 'pending',
          totalAmount
        });

        const carriers = await Carrier.find({ status: 'Active' });
        const carrier = carriers.length > 0 
            ? carriers[randomInt(0, carriers.length - 1)].name 
            : 'Astratos Express';

        const shipment = await Shipment.create({
          orderId: order._id,
          carrier,
          trackingNumber: 'TRK-AUTO-' + Date.now().toString().slice(-6),
          destination: 'Pending Assignment',
          status: 'pending'
        });

        await logAudit('Order Created (Auto)', 'system', customer.name, `Auto-generated #${order._id.toString().slice(-6)}`);
        
        broadcast('ORDER_CREATED', order);
        broadcast('SHIPMENT_CREATED', shipment);
    }
  } catch (err) {
    console.error('Auto order generation failed:', err.message);
  }
};

const generateSupplierDelivery = async () => {
  try {
    const stockItems = await Stock.find();
    if (stockItems.length === 0) return;

    // Shuffle-bag: draw from a randomly shuffled queue; reshuffle when empty
    let suppliers = await Supplier.find({ status: 'Active' });
    let supplierName = 'Astratos Default Supplier';
    if (suppliers.length > 0) {
      if (supplierQueue.length === 0) {
        // Refill and shuffle the queue (Fisher-Yates)
        supplierQueue = [...suppliers.map(s => s.name)];
        for (let i = supplierQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [supplierQueue[i], supplierQueue[j]] = [supplierQueue[j], supplierQueue[i]];
        }
      }
      supplierName = supplierQueue.pop();
    }

    const item = stockItems[randomInt(0, stockItems.length - 1)];
    const addQty = randomInt(20, 80);
    
    item.quantity += addQty;
    await item.save();

    await logAudit(`Delivery from Supplier ${supplierName}`, 'system', item.name, `+${addQty} units delivered to ${item.department}`);
    
    broadcast('NOTIFICATION', {
      type: 'RESTOCK',
      message: `${item.name} restocked by ${supplierName}.`
    });

    broadcast('INVENTORY_UPDATE', { 
      type: 'RESTOCK', 
      item: item.name, 
      quantity: item.quantity 
    });
    
    // Explicit event to trigger supplier graph updates
    broadcast('SUPPLIER_DELIVERY', {
      supplier: supplierName,
      item: item.name,
      quantityAdded: addQty
    });

  } catch (err) {
    console.error('Supplier delivery simulation failed:', err.message);
  }
};

const autoProgressOrdersToShipped = async (forceProcessAll = false) => {
    try {
        const pendingCount = await Order.countDocuments({ status: 'pending' });
        if (pendingCount === 0) return;
        
        // Controlled and random processing to maintain a healthy visual backlog queue
        let processCount = forceProcessAll ? pendingCount : 0;
        if (!forceProcessAll) {
            if (pendingCount > 15) {
                processCount = randomInt(4, 7);
            } else if (pendingCount > 5) {
                processCount = randomInt(1, 3);
            } else {
                processCount = randomInt(1, 2); // Process at least 1-2 to maintain rhythm
            }
        }

        if (processCount === 0) return;

        const pendingOrders = await Order.find({ status: 'pending' }).limit(processCount);
        for (const order of pendingOrders) {
            order.status = 'shipped';
            await order.save();
            await logAudit('Order Shipped (Auto)', 'system', order.customer?.name || 'Unknown', `Auto-progressed order #${order._id.toString().slice(-6)} to Shipped`);
            broadcast('ORDER_UPDATED', order);
            broadcast('SALES_UPDATE', order); // Processed orders update sales graph
        }
    } catch (err) {
        console.error('Auto order progression failed:', err.message);
    }
};

const progressShipments = async () => {
  try {
    const pendingShipments = await Shipment.find({ status: 'pending' }).limit(2);
    for (const s of pendingShipments) {
        s.status = 'in transit';
        s.destination = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Mumbai, India', 'Dubai, UAE', 'Berlin, Germany'][randomInt(0, 5)];
        await s.save();
        await logAudit('Shipment Progression', 'system', s.carrier, `Shipment #${s.trackingNumber} progressed from pending → in transit`);
        broadcast('SHIPMENT_UPDATED', s);
    }

    const transitShipments = await Shipment.find({ status: 'in transit' }).limit(2);
    for (const s of transitShipments) {
        s.status = 'delivered';
        await s.save();
        await logAudit('Shipment Progression', 'system', s.carrier, `Shipment #${s.trackingNumber} progressed from in transit → delivered`);
        broadcast('SHIPMENT_UPDATED', s);
    }
  } catch (err) {
    console.error('Shipment progression failed:', err.message);
  }
};

let isRunning = false;
let cycleTimeout = null;

const isSimulationRunning = () => isRunning;

const runSimulationCycle = async () => {
  if (!isRunning) return;

  try {
    // Step 1: Generate Orders (Causes inventory dip)
    await generateAutoOrder();
    
    // Wait for the sales delay
    if (!isRunning) return;
    await new Promise(r => { cycleTimeout = setTimeout(r, 2000); });
    
    // Step 2: Ship Orders (Causes sales spike instantly)
    await autoProgressOrdersToShipped();
    
    // Progress shipments while we are at it
    await progressShipments();
    
    // Wait for restock delay
    if (!isRunning) return;
    await new Promise(r => { cycleTimeout = setTimeout(r, 8000); });

    // Step 3: Supplier Delivery (Causes inventory spike)
    await generateSupplierDelivery();

    // Wait before repeating cycle
    if (!isRunning) return;
    await new Promise(r => { cycleTimeout = setTimeout(r, 10000); });

    // Recursively loop
    runSimulationCycle();

  } catch (err) {
    console.error('Simulation cycle error:', err);
    if (isRunning) {
      cycleTimeout = setTimeout(runSimulationCycle, 5000);
    }
  }
};

const startOperatorSimulation = (wss) => {
  if (isSimulationRunning()) return;
  currentWss = wss; // Capture the global websocket server
  console.log('Operator simulation started (Rhythmic Sequencer)');
  isRunning = true;
  runSimulationCycle();
};

const stopOperatorSimulation = () => {
  isRunning = false;
  if (cycleTimeout) clearTimeout(cycleTimeout);
  console.log('Operator simulation stopped');
};

module.exports = { 
  startOperatorSimulation, 
  stopOperatorSimulation, 
  isSimulationRunning, 
  generateAutoOrder, 
  generateSupplierDelivery,
  autoProgressOrdersToShipped,
  setSimulationWss,
  broadcast,
  CUSTOMERS
};

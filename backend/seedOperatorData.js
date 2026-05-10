require('dotenv').config();
const mongoose = require('mongoose');

const Order = require('./models/Order');
const Stock = require('./models/Stock');
const Shipment = require('./models/Shipment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/astratos';

const CUSTOMERS = [
  { name: 'Dr. Evelyn Hayes', email: 'e.hayes@astratos.io', phone: '+1 555-0192' },
  { name: 'Marcus Chen', email: 'marcus.chen@nexus.corp', phone: '+1 555-0234' },
  { name: 'Sofia Petrov', email: 'sofia.p@orion-logistics.com', phone: '+44 20 7946 0111' },
  { name: 'James Nakamura', email: 'j.nakamura@atlas-tech.io', phone: '+81 3-5555-0198' },
  { name: 'Amara Osei', email: 'amara.osei@zenith.co', phone: '+233 55-987-6543' },
  { name: 'Nikolai Volkov', email: 'n.volkov@ares-ind.com', phone: '+7 495-555-0132' },
  { name: 'Isabella Romano', email: 'i.romano@vega-supply.eu', phone: '+39 06-555-0187' },
  { name: 'Raj Patel', email: 'raj.patel@titan-group.in', phone: '+91 98765-43210' },
  { name: 'Luna Martinez', email: 'luna.m@stellarworks.co', phone: '+1 555-0276' },
  { name: 'Kwame Asante', email: 'k.asante@phoenix-mfg.com', phone: '+233 24-555-0145' },
  { name: 'Yuki Tanaka', email: 'yuki.t@horizon-labs.jp', phone: '+81 3-5555-0223' },
  { name: 'Elena Kowalski', email: 'elena.k@nova-dynamics.pl', phone: '+48 22-555-0198' },
  { name: 'Omar Farouk', email: 'omar.f@crescent-trade.ae', phone: '+971 4-555-0167' },
  { name: 'Priya Sharma', email: 'priya.s@quantum-solutions.in', phone: '+91 98123-45678' },
  { name: 'Diego Alvarez', email: 'diego.a@meridian-corp.mx', phone: '+52 55-5555-0134' },
  { name: 'Aisha Bello', email: 'aisha.b@apex-industries.ng', phone: '+234 802-555-0123' },
  { name: "Liam O'Connor", email: 'liam.oc@celtic-freight.ie', phone: '+353 1-555-0198' },
  { name: 'Mei Lin Wu', email: 'meiling.w@dragontech.cn', phone: '+86 10-5555-0145' }
];

const DEPARTMENTS = ['Main Warehouse', 'Side Warehouse', 'Assembly Bay', 'Cold Storage', 'Heavy Logistics', 'Quality Control'];
const CATEGORIES = ['Electronics', 'Parts', 'Accessories', 'Propulsion', 'Medical', 'Robotics', 'Life Support', 'Packaging'];
const CARRIERS = ['FedEx', 'UPS', 'DHL Global', 'USPS', 'Blue Dart', 'Aramex', 'Astratos Express'];

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        console.log('Connected to DB. Clearing existing operator data...');

        await Order.deleteMany({});
        await Stock.deleteMany({});
        await Shipment.deleteMany({});

        console.log('Populating Demo Stock...');
        const stockItems = [
            { name: 'Quantum Processor X', sku: 'QP-X-01', category: 'Electronics', quantity: 154, threshold: 50, department: 'Main Warehouse', price: 299.99 },
            { name: 'Neural Link Adapter', sku: 'NLA-441', category: 'Accessories', quantity: 23, threshold: 30, department: 'Assembly Bay', price: 89.50 },
            { name: 'Hyperdrive Core', sku: 'HDC-9B', category: 'Propulsion', quantity: 5, threshold: 10, department: 'Heavy Logistics', price: 45000.00 },
            { name: 'Plasma Injectors', sku: 'PI-20', category: 'Parts', quantity: 540, threshold: 100, department: 'Main Warehouse', price: 1520.20 },
            { name: 'Stasis Pods', sku: 'SP-100', category: 'Medical', quantity: 0, threshold: 5, department: 'Cold Storage', price: 12000.00 },
            { name: 'Flux Capacitor', sku: 'FC-77', category: 'Electronics', quantity: 88, threshold: 20, department: 'Side Warehouse', price: 750.00 },
            { name: 'Bio-Metric Scanner', sku: 'BMS-12', category: 'Accessories', quantity: 12, threshold: 15, department: 'Quality Control', price: 420.00 },
            { name: 'Cryo Coolant Pack', sku: 'CCP-03', category: 'Life Support', quantity: 200, threshold: 50, department: 'Cold Storage', price: 65.00 },
            { name: 'Robotic Arm Module', sku: 'RAM-55', category: 'Robotics', quantity: 34, threshold: 10, department: 'Assembly Bay', price: 8900.00 },
            { name: 'Nano-Fiber Cable', sku: 'NFC-300', category: 'Parts', quantity: 1200, threshold: 200, department: 'Main Warehouse', price: 12.50 },
            { name: 'Thermal Shield Panel', sku: 'TSP-08', category: 'Parts', quantity: 67, threshold: 25, department: 'Heavy Logistics', price: 3200.00 },
            { name: 'AI Processing Unit', sku: 'APU-X2', category: 'Electronics', quantity: 15, threshold: 20, department: 'Side Warehouse', price: 15000.00 },
            { name: 'Emergency Beacon', sku: 'EB-901', category: 'Life Support', quantity: 300, threshold: 50, department: 'Main Warehouse', price: 175.00 },
            { name: 'Cargo Netting Roll', sku: 'CNR-40', category: 'Packaging', quantity: 450, threshold: 100, department: 'Side Warehouse', price: 28.00 },
            { name: 'Pressure Valve Set', sku: 'PVS-16', category: 'Parts', quantity: 8, threshold: 15, department: 'Quality Control', price: 560.00 }
        ];

        for (let i = 16; i <= 25; i++) {
            const price = Number((Math.random() * 5000 + 100).toFixed(2));
            const qty = Math.floor(Math.random() * 300);
            stockItems.push({
                name: `Industrial Asset ${CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]} Mk-${i}`,
                sku: `INT-MK${i}-${Math.floor(Math.random()*9000)+1000}`,
                category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
                quantity: qty,
                threshold: Math.floor(qty * 0.15) || 5,
                department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
                price: price
            });
        }
        
        const createdStock = await Stock.insertMany(stockItems);

        console.log('Populating Demo Orders...');
        const orderItems = [
            {
                customer: CUSTOMERS[0],
                items: [
                   { product: 'Quantum Processor X', quantity: 2, price: 299.99 },
                   { product: 'Neural Link Adapter', quantity: 5, price: 89.50 }
                ],
                status: 'pending',
                totalAmount: 1047.48
            },
            {
                customer: CUSTOMERS[1],
                items: [
                   { product: 'Plasma Injectors', quantity: 100, price: 15.20 }
                ],
                status: 'processed',
                totalAmount: 1520.00
            },
            {
                customer: CUSTOMERS[5],
                items: [
                   { product: 'Stasis Pods', quantity: 1, price: 12000.00 },
                   { product: 'Hyperdrive Core', quantity: 1, price: 45000.00 }
                ],
                status: 'shipped',
                totalAmount: 57000.00
            },
            {
                customer: CUSTOMERS[3],
                items: [
                   { product: 'Quantum Processor X', quantity: 1, price: 299.99 }
                ],
                status: 'rejected',
                totalAmount: 299.99
            },
            {
                customer: CUSTOMERS[7],
                items: [
                   { product: 'Robotic Arm Module', quantity: 2, price: 8900.00 },
                   { product: 'AI Processing Unit', quantity: 1, price: 15000.00 }
                ],
                status: 'pending',
                totalAmount: 32800.00
            },
            {
                customer: CUSTOMERS[10],
                items: [
                   { product: 'Flux Capacitor', quantity: 3, price: 750.00 }
                ],
                status: 'pending',
                totalAmount: 2250.00
            }
        ];
        const createdOrders = await Order.insertMany(orderItems);

        console.log('Populating Demo Shipments...');
        const shippedOrder = createdOrders.find(o => o.status === 'shipped');
        const shipments = [
            {
                orderId: shippedOrder._id,
                carrier: 'FedEx',
                trackingNumber: 'FX-88942-A',
                status: 'in transit',
                destination: 'Sector 4, Luna Base',
                estimatedDelivery: new Date(Date.now() + 86400000 * 2) 
            },
            {
                orderId: new mongoose.Types.ObjectId(),
                carrier: 'UPS',
                trackingNumber: '1Z9999999999999999',
                status: 'delivered',
                destination: 'New York, USA',
                estimatedDelivery: new Date(Date.now() - 86400000 * 1) 
            },
            {
                orderId: new mongoose.Types.ObjectId(), 
                carrier: 'DHL Global',
                trackingNumber: 'DHL-291039401',
                status: 'pending',
                destination: 'Tokyo, Japan',
                estimatedDelivery: new Date(Date.now() + 86400000 * 5) 
            },
            {
                orderId: new mongoose.Types.ObjectId(),
                carrier: 'Blue Dart',
                trackingNumber: 'BD-20260323-001',
                status: 'in transit',
                destination: 'Mumbai, India',
                estimatedDelivery: new Date(Date.now() + 86400000 * 3)
            },
            {
                orderId: new mongoose.Types.ObjectId(),
                carrier: 'Aramex',
                trackingNumber: 'ARX-55021987',
                status: 'pending',
                destination: 'Dubai, UAE',
                estimatedDelivery: new Date(Date.now() + 86400000 * 4)
            },
            {
                orderId: new mongoose.Types.ObjectId(),
                carrier: 'USPS',
                trackingNumber: 'USPS-9400111899223',
                status: 'in transit',
                destination: 'Los Angeles, USA',
                estimatedDelivery: new Date(Date.now() + 86400000 * 2)
            },
            {
                orderId: new mongoose.Types.ObjectId(),
                carrier: 'Astratos Express',
                trackingNumber: 'AEX-PRIME-00712',
                status: 'delivered',
                destination: 'Berlin, Germany',
                estimatedDelivery: new Date(Date.now() - 86400000 * 2)
            }
        ];
        await Shipment.insertMany(shipments);

        console.log('Demo Data successfully seeded!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();

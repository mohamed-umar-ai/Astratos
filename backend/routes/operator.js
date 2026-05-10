const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Stock = require('../models/Stock');
const Shipment = require('../models/Shipment');
const Log = require('../models/Log');
const { verifyToken } = require('../middleware/auth');
const { broadcast } = require('../simulation/operatorSimulation');

const logAudit = async (action, user, item, details) => {
  try {
    await Log.create({
      type: action,
      user: user || 'system',
      message: item || 'N/A',
      details: details || ''
    });
    // Also broadcast a generic notification to refresh logs
    broadcast('NOTIFICATION', { type: 'LOG_UPDATE', message: `Audit: ${action}` });
  } catch (err) {
    console.error('logAudit failed:', err.message);
  }
};

router.use(verifyToken);

// ================= ORDERS =================

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/orders/new', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        
        const Carrier = require('../models/Carrier');
        const activeCarriers = await Carrier.find({ status: 'Active' });
        const randomCarrier = activeCarriers.length > 0 
            ? activeCarriers[Math.floor(Math.random() * activeCarriers.length)].name 
            : 'Astratos Express';
        await Shipment.create({
            orderId: order._id,
            carrier: randomCarrier,
            trackingNumber: 'TRK-PND-' + Date.now().toString().slice(-6),
            destination: 'Pending Assignment',
            status: 'pending'
        });

        const source = req.body._source === 'auto' ? 'Auto' : 'Manual';
        await logAudit(`Order Created (${source})`, req.user.email, order.customer?.name, `New order $${order.totalAmount?.toFixed(2)} with ${order.items?.length} items`);

        // Sync with dashboard graphs
        broadcast('ORDER_CREATED', order);
        
        // Deduct inventory for manual orders
        if (req.body.items) {
            for (const item of req.body.items) {
                const stock = await Stock.findOne({ name: item.product });
                if (stock) {
                    stock.quantity -= item.quantity;
                    await stock.save();
                    broadcast('INVENTORY_UPDATE', { type: 'ORDER_DECREASE', item: stock.name, quantity: stock.quantity });
                }
            }
        }

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/orders/:id', async (req, res) => {
    try {
        const { status, items, totalAmount } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (items) updateData.items = items;
        if (totalAmount !== undefined) updateData.totalAmount = totalAmount;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        let details = `Status → ${order.status}`;
        if (items) details += `, Items updated (${items.length})`;
        
        await logAudit('Order Updated', req.user.email, order.customer?.name, details);
        broadcast('ORDER_UPDATED', order);
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        if (order.status === 'shipped') {
             return res.status(400).json({ success: false, message: 'Cannot delete shipped orders. Please process a return instead.' });
        }
        
        await Order.findByIdAndDelete(req.params.id);
        await logAudit('Order Deleted', req.user.email, order.customer?.name || 'Unknown', `Order ID: ${req.params.id}`);
        broadcast('ORDER_UPDATED', { _id: req.params.id, deleted: true });
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/orders/:id/ship', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'shipped' },
            { new: true }
        );
        
        const { carrier, trackingNumber, destination } = req.body;
        const existingShipment = await Shipment.findOne({ orderId: order._id });
        if (existingShipment) {
            existingShipment.status = 'in transit';
            if (carrier) existingShipment.carrier = carrier;
            if (trackingNumber) existingShipment.trackingNumber = trackingNumber;
            if (destination) existingShipment.destination = destination;
            await existingShipment.save();
        } else {
            if (carrier && trackingNumber) {
                 await Shipment.create({
                     orderId: order._id,
                     carrier,
                     trackingNumber,
                     destination: destination || 'Unknown',
                     status: 'in transit'
                 });
            }
        }

        await logAudit('Order Shipped', req.user.email, order.customer?.name, `Shipped via ${carrier || 'auto-carrier'}`);
        
        // Instantly spike sales graph
        broadcast('SALES_UPDATE', order);

        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= STOCK =================

router.get('/stock', async (req, res) => {
    try {
        const stock = await Stock.find().sort({ name: 1 });
        res.json({ success: true, data: stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stock/value', async (req, res) => {
    try {
        const stock = await Stock.find();
        const totalValue = stock.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const totalItems = stock.reduce((acc, item) => acc + item.quantity, 0);
        res.json({ success: true, data: { totalValue, totalItems, productCount: stock.length } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stock/alerts', async (req, res) => {
    try {
        const lowStock = await Stock.find({ $expr: { $lte: ['$quantity', '$threshold'] } });
        const alerts = lowStock.map(item => ({
            _id: item._id,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            threshold: item.threshold,
            department: item.department,
            suggestedReorder: Math.max(item.threshold * 2 - item.quantity, item.threshold)
        }));
        res.json({ success: true, data: alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stock/meta', async (req, res) => {
    try {
        const stock = await Stock.find();
        const categories = [...new Set(stock.map(s => s.category))].sort();
        const departments = [...new Set(stock.map(s => s.department))].sort();
        res.json({ success: true, data: { categories, departments } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/stock/add', async (req, res) => {
    try {
        const { id, quantity } = req.body;
        if (id) {
             const stock = await Stock.findByIdAndUpdate(
                 id,
                 { $inc: { quantity: quantity } },
                 { new: true }
             );
             await logAudit('Stock Added', req.user.email, stock.name, `+${quantity} units (now ${stock.quantity})`);
             broadcast('INVENTORY_UPDATE', { type: 'RESTOCK', item: stock.name, quantity: stock.quantity });
             return res.json({ success: true, data: stock });
        } else {
             const newStock = await Stock.create(req.body);
             await logAudit('New Product Created', req.user.email, newStock.name, `SKU: ${newStock.sku}, Qty: ${newStock.quantity}, Dept: ${newStock.department}`);
             broadcast('INVENTORY_UPDATE', { type: 'RESTOCK', item: newStock.name, quantity: newStock.quantity });
             return res.status(201).json({ success: true, data: newStock });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/stock/reduce', async (req, res) => {
    try {
        const { id, quantity } = req.body;
        const stock = await Stock.findByIdAndUpdate(
            id,
            { $inc: { quantity: -quantity } },
            { new: true }
        );
        await logAudit('Stock Reduced', req.user.email, stock.name, `-${quantity} units (now ${stock.quantity})`);
        broadcast('INVENTORY_UPDATE', { type: 'DECREASE', item: stock.name, quantity: stock.quantity });
        res.json({ success: true, data: stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/stock/transfer', async (req, res) => {
    try {
        const { id, department } = req.body;
        const stock = await Stock.findById(id);
        const oldDept = stock.department;
        stock.department = department;
        await stock.save();
        await logAudit('Stock Transferred', req.user.email, stock.name, `${oldDept} → ${department}`);
        broadcast('INVENTORY_UPDATE', { type: 'TRANSFER', item: stock.name, quantity: stock.quantity });
        res.json({ success: true, data: stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= SHIPPING =================

router.post('/stock/delete', async (req, res) => {
    try {
        const { id } = req.body;
        const stock = await Stock.findByIdAndDelete(id);
        if (!stock) return res.status(404).json({ success: false, message: 'Stock not found' });
        await logAudit('Stock Deleted', req.user.email, stock.name, `Removed entirely`);
        broadcast('INVENTORY_UPDATE', { type: 'DELETE', item: stock.name });
        res.json({ success: true, data: stock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/shipping', async (req, res) => {
    try {
        const shipments = await Shipment.find().populate('orderId').sort({ createdAt: -1 });
        res.json({ success: true, data: shipments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/shipping/new', async (req, res) => {
    try {
        const shipment = await Shipment.create(req.body);
        await logAudit('Shipment Created', req.user.email, shipment.carrier, `Tracking: ${shipment.trackingNumber}, Dest: ${shipment.destination}`);
        broadcast('SHIPMENT_CREATED', shipment);
        res.status(201).json({ success: true, data: shipment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/shipping/:id/update', async (req, res) => {
    try {
        const oldShipment = await Shipment.findById(req.params.id);
        const shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        const changes = [];
        if (req.body.status && req.body.status !== oldShipment.status) changes.push(`Status: ${oldShipment.status} → ${req.body.status}`);
        if (req.body.trackingNumber && req.body.trackingNumber !== oldShipment.trackingNumber) changes.push(`Tracking: ${req.body.trackingNumber}`);
        if (changes.length > 0) {
            await logAudit('Shipment Updated', req.user.email, shipment.carrier, changes.join(', '));
            broadcast('NOTIFICATION', { type: 'SHIPMENT_UPDATE', message: `Shipment ${shipment.trackingNumber} updated.` });
        }
        res.json({ success: true, data: shipment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= AUDIT TRAIL =================

router.get('/audit-trail', async (req, res) => {
    try {
        const category = req.query.category || '';

        // Build a filter against the MongoDB Log collection
        let typeFilter = {};
        if (category === 'orders') {
            typeFilter = { type: { $regex: /order/i } };
        } else if (category === 'stock') {
            typeFilter = { type: { $regex: /stock|product|delivery/i } };
        } else if (category === 'shipping') {
            typeFilter = { type: { $regex: /ship/i } };
        }

        const logs = await Log.find(typeFilter).sort({ createdAt: -1 }).limit(30);

        const formatted = logs.map(l => ({
            id: l._id,
            action: l.type,
            user: l.user,
            item: l.message || 'N/A',
            details: typeof l.details === 'string' ? l.details : JSON.stringify(l.details),
            timestamp: l.createdAt
        }));

        res.json({ success: true, data: formatted });
    } catch (err) {
        res.json({ success: true, data: [] });
    }
});

module.exports = router;

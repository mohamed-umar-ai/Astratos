const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Carrier = require('../models/Carrier');
const Log = require('../models/Log');

// Define default partners
const DEFAULT_PARTNERS = ['FedEx', 'UPS', 'DHL Global', 'USPS', 'Blue Dart', 'Aramex', 'Astratos Express'];

// Auto-seed Database on module load
const seedDatabase = async () => {
    try {
        const supplierCount = await Supplier.countDocuments();
        if (supplierCount === 0) {
            console.log('Seeding default Suppliers...');
            const suppliersToSeed = DEFAULT_PARTNERS.map(name => ({
                name,
                email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
                phone: '+1 555-0000',
                department: 'Global Logistics',
                category: 'Delivery Partner',
                status: 'Active'
            }));
            await Supplier.insertMany(suppliersToSeed);
        }

        const carrierCount = await Carrier.countDocuments();
        if (carrierCount === 0) {
            console.log('Seeding default Carriers...');
            const carriersToSeed = DEFAULT_PARTNERS.map(name => ({
                name,
                contactEmail: `dispatch@${name.toLowerCase().replace(/\s+/g, '')}.com`,
                phone: '+1 555-1111',
                status: 'Active'
            }));
            await Carrier.insertMany(carriersToSeed);
        }

        const logCount = await Log.countDocuments({ type: { $regex: /^Delivery from Supplier/ } });
        if (logCount === 0) {
            console.log('Seeding initial delivery logs for graph...');
            const dummyLogs = [];
            for (const name of DEFAULT_PARTNERS) {
                // Seed 1 to 5 random deliveries per supplier
                const numDeliveries = Math.floor(Math.random() * 5) + 1;
                for (let i = 0; i < numDeliveries; i++) {
                    const randomDaysAgo = Math.floor(Math.random() * 20) + 1;
                    const date = new Date();
                    date.setDate(date.getDate() - randomDaysAgo);
                    dummyLogs.push({
                        type: `Delivery from Supplier ${name}`,
                        user: 'system',
                        message: 'Stock restocked via delivery',
                        details: `Simulated past delivery`,
                        createdAt: date
                    });
                }
            }
            await Log.insertMany(dummyLogs);
        }
    } catch (err) {
        console.error('Error seeding DB:', err.message);
    }
};
seedDatabase();

router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });

        // Calculate delivery counts (last 30 days) for active/inactive status
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deliveries = await Log.find({
            type: { $regex: /^Delivery from Supplier/ },
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Map supplier name to delivery count
        const deliveryMap = {};
        deliveries.forEach(d => {
            const match = d.type.match(/^Delivery from Supplier (.+)$/);
            if (match && match[1]) {
                const name = match[1];
                deliveryMap[name] = (deliveryMap[name] || 0) + 1;
            }
        });

        const activeThresholdDays = 30;

        const enrichedSuppliers = await Promise.all(suppliers.map(async s => {
            // Find most recent delivery
            const recentDelivery = await Log.findOne({ type: `Delivery from Supplier ${s.name}` }).sort({ createdAt: -1 });
            
            let isActive = false;
            let lastDelivery = null;
            if (recentDelivery) {
                lastDelivery = recentDelivery.createdAt;
                const daysSince = (new Date() - new Date(recentDelivery.createdAt)) / (1000 * 60 * 60 * 24);
                if (daysSince <= activeThresholdDays) isActive = true;
            }

            s.status = isActive ? 'Active' : 'Inactive';
            await s.save();

            return {
                ...s.toObject(),
                deliveryCount: deliveryMap[s.name] || 0,
                lastDelivery
            };
        }));

        res.json({ success: true, data: enrichedSuppliers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/new', async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        
        await Log.create({
            type: 'Supplier Created',
            user: 'system',
            message: `New supplier added`,
            details: `Supplier: ${supplier.name} (${supplier.category})`
        });

        const wss = req.app.get('wss');
        if (wss) {
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        type: 'NOTIFICATION',
                        payload: { type: 'NEW_SUPPLIER', message: `New supplier added: ${supplier.name}.` }
                    }));
                }
            });
        }

        res.status(201).json({ success: true, data: supplier });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/graph-data', async (req, res) => {
    try {
        const deliveries = await Log.find({ type: { $regex: /^Delivery from Supplier/ } }).sort({ createdAt: 1 });
        // Format for a line/bar chart
        const graphData = [];
        const supplierTotals = {};

        deliveries.forEach(d => {
            const match = d.type.match(/^Delivery from Supplier (.+)$/);
            if (match && match[1]) {
                const name = match[1];
                supplierTotals[name] = (supplierTotals[name] || 0) + 1;
            }
        });

        for (const [name, count] of Object.entries(supplierTotals)) {
            graphData.push({ name, deliveries: count });
        }

        res.json({ success: true, data: graphData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= CARRIER ROUTES =================

router.get('/carriers', async (req, res) => {
    try {
        const carriers = await Carrier.find().sort({ name: 1 });
        res.json({ success: true, data: carriers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/carriers', async (req, res) => {
    try {
        const carrier = await Carrier.create(req.body);
        
        await Log.create({
            type: 'Carrier Created',
            user: 'system',
            message: `New delivery partner added`,
            details: `Carrier: ${carrier.name}`
        });

        const wss = req.app.get('wss');
        if (wss) {
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        type: 'NOTIFICATION',
                        payload: { type: 'NEW_CARRIER', message: `New delivery partner added: ${carrier.name}.` }
                    }));
                }
            });
        }

        res.status(201).json({ success: true, data: carrier });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

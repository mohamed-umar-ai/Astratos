const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { verifyToken, roleCheck } = require('../middleware/auth');

router.use(verifyToken, roleCheck('admin'));

router.get('/', async (req, res) => {
    try {
        const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Error fetching logs' });
    }
});

router.post('/seed', async (req, res) => {
    try {
        const count = await Log.countDocuments();
        if (count > 0) {
            return res.json({ message: 'Logs already seeded', count });
        }

        const now = Date.now();
        const mockLogs = [
            { type: 'login', user: 'admin@example.com', message: 'Admin login successful', createdAt: new Date(now - 60000) },
            { type: 'system', user: 'system', message: 'System heartbeat check ok', createdAt: new Date(now - 55000) },
            { type: 'notification', user: 'system', message: 'CRITICAL: Restock needed for SKU-123 (Stock < 10)', createdAt: new Date(now - 45000) },
            { type: 'notification', user: 'system', message: 'CRITICAL: Restock needed for SKU-456 (Stock < 5)', createdAt: new Date(now - 40000) },
            { type: 'inventory', user: 'operator@example.com', message: 'Restocked SKU-123 (+50 units)', createdAt: new Date(now - 30000) },
            { type: 'notification', user: 'system', message: 'RESOLVED: SKU-123 has been restocked', createdAt: new Date(now - 25000) },
            { type: 'inventory', user: 'operator@example.com', message: 'Updated threshold for SKU-789', createdAt: new Date(now - 20000) },
            { type: 'login', user: 'operator@example.com', message: 'Operator login successful', createdAt: new Date(now - 15000) },
            { type: 'system', user: 'system', message: 'Database backup completed', createdAt: new Date(now - 5000) }
        ];
        await Log.insertMany(mockLogs);
        res.json({ message: 'Seeded fresh logs successfully', count: mockLogs.length });
    } catch (error) {
        console.error('Error seeding logs:', error);
        res.status(500).json({ message: 'Error seeding logs' });
    }
});

module.exports = router;

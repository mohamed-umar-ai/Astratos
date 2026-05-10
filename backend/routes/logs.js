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

        const mockLogs = [
            { type: 'login', user: 'admin@example.com', message: 'Admin login successful' },
            { type: 'inventory', user: 'operator@example.com', message: 'Updated threshold for SKU-123' },
            { type: 'forecast', user: 'system', message: 'Daily forecast generated' },
            { type: 'security', user: 'system', message: 'Failed login attempt from 192.168.1.50' },
            { type: 'notification', user: 'system', message: 'Low inventory alert sent for SKU-456' },
            { type: 'login', user: 'viewer@example.com', message: 'Viewer login successful' },
            { type: 'system', user: 'system', message: 'System heartbeat check ok' }
        ];
        await Log.insertMany(mockLogs);
        res.json({ message: 'Seeded logs successfully', count: mockLogs.length });
    } catch (error) {
        console.error('Error seeding logs:', error);
        res.status(500).json({ message: 'Error seeding logs' });
    }
});

module.exports = router;

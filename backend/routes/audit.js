const express = require('express');
const router = express.Router();

// Generate mock audit trail data
const generateAuditLogs = () => {
    const actions = ['Stock Update', 'Price Change', 'New Order', 'Restock', 'Adjustment', 'Delete Item', 'User Login', 'User Logout', 'Settings Changed'];
    const users = ['admin@astratos.com', 'john.doe@company.com', 'jane.smith@company.com', 'system'];
    const items = ['Widget Pro', 'Gadget X', 'Component A', 'Module Z', 'Device Pro', 'Sensor Unit', 'N/A'];

    return Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        action: actions[Math.floor(Math.random() * actions.length)],
        user: users[Math.floor(Math.random() * users.length)],
        item: items[Math.floor(Math.random() * items.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        details: `Changed quantity from ${Math.floor(Math.random() * 100)} to ${Math.floor(Math.random() * 100)}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

let auditLogs = generateAuditLogs();

// GET all audit logs with pagination
router.get('/', (req, res) => {
    const { action, user, page = 1, limit = 20, search } = req.query;

    let filtered = [...auditLogs];

    if (action) {
        filtered = filtered.filter(log => log.action === action);
    }

    if (user) {
        filtered = filtered.filter(log => log.user.toLowerCase().includes(user.toLowerCase()));
    }

    if (search) {
        filtered = filtered.filter(log =>
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.item.toLowerCase().includes(search.toLowerCase())
        );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogs = filtered.slice(startIndex, endIndex);

    res.json({
        success: true,
        count: filtered.length,
        page: parseInt(page),
        totalPages: Math.ceil(filtered.length / limit),
        data: paginatedLogs
    });
});

// GET audit log by ID
router.get('/:id', (req, res) => {
    const log = auditLogs.find(l => l.id === parseInt(req.params.id));

    if (!log) {
        return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.json({ success: true, data: log });
});

// GET audit statistics
router.get('/stats/summary', (req, res) => {
    const today = new Date().toDateString();
    const stats = {
        totalEntries: auditLogs.length,
        todayEntries: auditLogs.filter(log => new Date(log.timestamp).toDateString() === today).length,
        uniqueUsers: [...new Set(auditLogs.map(log => log.user))].length,
        actionBreakdown: auditLogs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {})
    };

    res.json({ success: true, data: stats });
});

// POST new audit entry (for logging actions)
router.post('/', (req, res) => {
    const { action, user, item, details, ipAddress } = req.body;

    if (!action || !user) {
        return res.status(400).json({ success: false, message: 'Action and user are required' });
    }

    const newLog = {
        id: auditLogs.length + 1,
        action,
        user,
        item: item || 'N/A',
        details: details || '',
        ipAddress: ipAddress || 'Unknown',
        timestamp: new Date().toISOString()
    };

    auditLogs.unshift(newLog);
    res.status(201).json({ success: true, data: newLog });
});

// GET available actions for filtering
router.get('/meta/actions', (req, res) => {
    const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
    res.json({ success: true, data: uniqueActions });
});

module.exports = router;

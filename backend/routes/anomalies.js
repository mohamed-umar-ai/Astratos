const express = require('express');
const router = express.Router();

const generateAnomalies = () => {
    const types = ['Stock Discrepancy', 'Unusual Sale Pattern', 'Price Anomaly', 'Supplier Issue', 'Demand Spike'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const items = ['Widget Pro', 'Gadget X', 'Component A', 'Module Z', 'Device Pro', 'Sensor Unit'];

    return Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: types[Math.floor(Math.random() * types.length)],
        item: items[Math.floor(Math.random() * items.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        detected: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        description: 'Detected unusual pattern in inventory data that requires attention.',
        status: Math.random() > 0.3 ? 'active' : 'resolved'
    }));
};

let anomalies = generateAnomalies();

router.get('/', (req, res) => {
    const { severity, status } = req.query;

    let filtered = [...anomalies];

    if (severity) {
        filtered = filtered.filter(a => a.severity === severity);
    }

    if (status) {
        filtered = filtered.filter(a => a.status === status);
    }

    res.json({
        success: true,
        count: filtered.length,
        data: filtered.sort((a, b) => new Date(b.detected) - new Date(a.detected))
    });
});

router.get('/:id', (req, res) => {
    const anomaly = anomalies.find(a => a.id === parseInt(req.params.id));

    if (!anomaly) {
        return res.status(404).json({ success: false, message: 'Anomaly not found' });
    }

    res.json({ success: true, data: anomaly });
});

router.put('/:id/resolve', (req, res) => {
    const index = anomalies.findIndex(a => a.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Anomaly not found' });
    }

    anomalies[index].status = 'resolved';
    anomalies[index].resolvedAt = new Date().toISOString();

    res.json({ success: true, data: anomalies[index] });
});

router.get('/stats/summary', (req, res) => {
    const stats = {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        high: anomalies.filter(a => a.severity === 'high').length,
        medium: anomalies.filter(a => a.severity === 'medium').length,
        low: anomalies.filter(a => a.severity === 'low').length,
        active: anomalies.filter(a => a.status === 'active').length,
        resolved: anomalies.filter(a => a.status === 'resolved').length
    };

    res.json({ success: true, data: stats });
});

module.exports = router;

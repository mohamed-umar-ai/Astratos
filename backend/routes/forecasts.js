const express = require('express');
const router = express.Router();

// Generate forecast data
const generateForecasts = () => {
    const items = ['Widget Pro', 'Gadget X', 'Component A', 'Module Z', 'Device Pro', 'Sensor Unit'];

    return items.map((item, index) => ({
        id: index + 1,
        item,
        currentStock: Math.floor(Math.random() * 500) + 50,
        predictedDemand: Math.floor(Math.random() * 200) + 50,
        reorderPoint: Math.floor(Math.random() * 100) + 20,
        confidence: Math.floor(Math.random() * 30) + 70,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        weeklyForecast: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10),
        monthlyForecast: Array.from({ length: 4 }, () => Math.floor(Math.random() * 200) + 50)
    }));
};

let forecasts = generateForecasts();

// GET all forecasts
router.get('/', (req, res) => {
    const { trend, lowStock } = req.query;

    let filtered = [...forecasts];

    if (trend) {
        filtered = filtered.filter(f => f.trend === trend);
    }

    if (lowStock === 'true') {
        filtered = filtered.filter(f => f.currentStock <= f.reorderPoint);
    }

    res.json({
        success: true,
        count: filtered.length,
        data: filtered
    });
});

// GET forecast for specific item
router.get('/:id', (req, res) => {
    const forecast = forecasts.find(f => f.id === parseInt(req.params.id));

    if (!forecast) {
        return res.status(404).json({ success: false, message: 'Forecast not found' });
    }

    res.json({ success: true, data: forecast });
});

// GET forecast summary
router.get('/stats/summary', (req, res) => {
    const stats = {
        totalItems: forecasts.length,
        averageConfidence: Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length),
        upTrend: forecasts.filter(f => f.trend === 'up').length,
        downTrend: forecasts.filter(f => f.trend === 'down').length,
        needsReorder: forecasts.filter(f => f.currentStock <= f.reorderPoint).length,
        totalPredictedDemand: forecasts.reduce((sum, f) => sum + f.predictedDemand, 0)
    };

    res.json({ success: true, data: stats });
});

// POST regenerate forecasts (simulate AI update)
router.post('/regenerate', (req, res) => {
    forecasts = generateForecasts();
    res.json({
        success: true,
        message: 'Forecasts regenerated',
        data: forecasts
    });
});

module.exports = router;

/**
 * Heartbeat Simulation Module
 * Generates randomized numbers within pre-planned ranges
 * Pushes real-time updates to connected WebSocket clients
 */

// Random number generators
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Simulation configuration with pre-planned ranges
const CONFIG = {
    metrics: {
        activeUsers: { min: 50, max: 500 },
        ordersPerMinute: { min: 5, max: 50 },
        revenue: { min: 1000, max: 10000 },
        cpuUsage: { min: 20, max: 85 },
        memoryUsage: { min: 30, max: 75 },
        responseTime: { min: 50, max: 300 }
    },
    inventory: {
        quantityChange: { min: -10, max: 20 },
        priceFluctuation: { min: -5, max: 5 }
    },
    alertChance: 0.3  // 30% chance to generate an alert
};

// Alert templates
const ALERT_TEMPLATES = [
    { type: 'info', text: 'New user registered' },
    { type: 'success', text: 'Order completed successfully' },
    { type: 'warning', text: 'High server load detected' },
    { type: 'info', text: 'Inventory restocked' },
    { type: 'success', text: 'Payment processed' },
    { type: 'warning', text: 'Low stock alert triggered' },
    { type: 'info', text: 'New supplier added' }
];

// Generate random alerts
const generateAlerts = () => {
    const alerts = [];
    if (Math.random() < CONFIG.alertChance) {
        const template = ALERT_TEMPLATES[randomInt(0, ALERT_TEMPLATES.length - 1)];
        alerts.push({
            ...template,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
    }
    return alerts;
};

// Generate simulation data snapshot
const generateHeartbeat = () => {
    const { metrics } = CONFIG;

    return {
        timestamp: new Date().toISOString(),
        metrics: {
            activeUsers: randomInt(metrics.activeUsers.min, metrics.activeUsers.max),
            ordersPerMinute: randomInt(metrics.ordersPerMinute.min, metrics.ordersPerMinute.max),
            revenue: randomFloat(metrics.revenue.min, metrics.revenue.max),
            systemHealth: {
                cpu: randomFloat(metrics.cpuUsage.min, metrics.cpuUsage.max),
                memory: randomFloat(metrics.memoryUsage.min, metrics.memoryUsage.max),
                responseTime: randomInt(metrics.responseTime.min, metrics.responseTime.max)
            }
        },
        alerts: generateAlerts()
    };
};

// Start heartbeat simulation loop
const startHeartbeat = (wss, intervalMs = 2000) => {
    console.log(`Heartbeat simulation started (interval: ${intervalMs}ms)`);

    return setInterval(() => {
        const data = generateHeartbeat();

        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(JSON.stringify({
                    type: 'SIMULATION_UPDATE',
                    payload: data
                }));
            }
        });
    }, intervalMs);
};

// Stop heartbeat simulation
const stopHeartbeat = (intervalId) => {
    clearInterval(intervalId);
    console.log('Heartbeat simulation stopped');
};

module.exports = {
    generateHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    randomInt,
    randomFloat,
    CONFIG
};

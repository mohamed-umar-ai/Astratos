/**
 * Simulator - Generates randomized data within pre-planned ranges
 * Pushes updates to all connected WebSocket clients
 */

const generateRandomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomFloat = (min, max, decimals = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

// Simulation data ranges
const SIMULATION_CONFIG = {
    inventory: {
        quantityChange: { min: -10, max: 20 },
        priceFluctuation: { min: -5, max: 5 } // percentage
    },
    metrics: {
        activeUsers: { min: 50, max: 500 },
        ordersPerMinute: { min: 5, max: 50 },
        revenue: { min: 1000, max: 10000 },
        cpuUsage: { min: 20, max: 85 },
        memoryUsage: { min: 30, max: 75 },
        responseTime: { min: 50, max: 300 }
    }
};

// Generate a full simulation snapshot
const generateSimulationData = () => {
    const metrics = SIMULATION_CONFIG.metrics;

    return {
        timestamp: new Date().toISOString(),
        metrics: {
            activeUsers: generateRandomInRange(metrics.activeUsers.min, metrics.activeUsers.max),
            ordersPerMinute: generateRandomInRange(metrics.ordersPerMinute.min, metrics.ordersPerMinute.max),
            revenue: generateRandomFloat(metrics.revenue.min, metrics.revenue.max),
            systemHealth: {
                cpu: generateRandomFloat(metrics.cpuUsage.min, metrics.cpuUsage.max),
                memory: generateRandomFloat(metrics.memoryUsage.min, metrics.memoryUsage.max),
                responseTime: generateRandomInRange(metrics.responseTime.min, metrics.responseTime.max)
            }
        },
        alerts: generateRandomAlerts()
    };
};

// Generate random alerts occasionally
const generateRandomAlerts = () => {
    const alerts = [];
    const alertTypes = ['info', 'warning', 'success'];
    const messages = [
        { type: 'info', text: 'New user registered' },
        { type: 'success', text: 'Order completed successfully' },
        { type: 'warning', text: 'High server load detected' },
        { type: 'info', text: 'Inventory restocked' },
        { type: 'success', text: 'Payment processed' }
    ];

    // 30% chance to generate an alert
    if (Math.random() < 0.3) {
        const randomAlert = messages[Math.floor(Math.random() * messages.length)];
        alerts.push({
            ...randomAlert,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
    }

    return alerts;
};

// Start simulation loop
const startSimulation = (wss, intervalMs = 2000) => {
    console.log(`Simulation started with ${intervalMs}ms interval`);

    return setInterval(() => {
        const data = generateSimulationData();

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

module.exports = {
    generateSimulationData,
    startSimulation,
    generateRandomInRange,
    generateRandomFloat
};

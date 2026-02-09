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
        activeUsers: { min: 800, max: 1200 }, // Corresponds to Inventory Overview 80k-120k scaled down or raw? User said "Inventory Overview (80,000–120,000)"
        // User specified ranges:
        // Incoming: 10k-20k, Outgoing: 8k-15k, Not Detected: 0-50 (Hero)
        // Inventory: 80k-120k, Sales: 50k-90k, Suppliers: 100-300
        // Anomalies: 0-50, Forecasts: 70k-110k, Audit: 1k-5k
        incomingPackages: { min: 10000, max: 20000 },
        outgoingPackages: { min: 8000, max: 15000 },
        packageNotDetected: { min: 0, max: 50 },
        inventoryCount: { min: 80000, max: 120000 },
        salesCount: { min: 50000, max: 90000 },
        supplierCount: { min: 100, max: 300 },
        anomalyCount: { min: 0, max: 50 },
        forecastDemand: { min: 70000, max: 110000 },
        auditTransactions: { min: 1000, max: 5000 }
    },
    alertChance: 0.3
};

// ... (ALERT_TEMPLATES remains same)

// Generate simulation data snapshot
const generateHeartbeat = () => {
    const { metrics } = CONFIG;

    return {
        timestamp: new Date().toISOString(),
        metrics: {
            incoming: randomInt(metrics.incomingPackages.min, metrics.incomingPackages.max),
            outgoing: randomInt(metrics.outgoingPackages.min, metrics.outgoingPackages.max),
            notDetected: randomInt(metrics.packageNotDetected.min, metrics.packageNotDetected.max),
            inventory: randomInt(metrics.inventoryCount.min, metrics.inventoryCount.max),
            sales: randomInt(metrics.salesCount.min, metrics.salesCount.max),
            suppliers: randomInt(metrics.supplierCount.min, metrics.supplierCount.max),
            anomalies: randomInt(metrics.anomalyCount.min, metrics.anomalyCount.max),
            forecasts: randomInt(metrics.forecastDemand.min, metrics.forecastDemand.max),
            audit: randomInt(metrics.auditTransactions.min, metrics.auditTransactions.max),
            systemHealth: {
                cpu: randomFloat(20, 85),
                memory: randomFloat(30, 75),
                responseTime: randomInt(50, 300)
            }
        },
        alerts: generateAlerts()
    };
};

// Start heartbeat simulation loop
const startHeartbeat = (wss, minInterval = 3000, maxInterval = 5000) => {
    // Random interval between 3-5 seconds
    const getInterval = () => randomInt(minInterval, maxInterval);

    console.log(`Heartbeat simulation started (interval: ${minInterval}-${maxInterval}ms)`);

    const runLoop = () => {
        const data = generateHeartbeat();

        // Broadcast
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    type: 'SIMULATION_UPDATE',
                    payload: data
                }));
            }
        });

        setTimeout(runLoop, getInterval());
    };

    runLoop();
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

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const CONFIG = {
    metrics: {
        activeUsers: { min: 800, max: 1200 },
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

const startHeartbeat = (wss, minInterval = 3000, maxInterval = 5000) => {
    const getInterval = () => randomInt(minInterval, maxInterval);

    console.log(`Heartbeat simulation started (interval: ${minInterval}-${maxInterval}ms)`);

    const runLoop = () => {
        const data = generateHeartbeat();

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

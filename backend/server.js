require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const connectDB = require('./db/mongoConfig');
const { startHeartbeat } = require('./simulation/heartbeat');
const { startOperatorSimulation, setSimulationWss } = require('./simulation/operatorSimulation');

const inventoryRoutes = require('./routes/inventory');
const anomaliesRoutes = require('./routes/anomalies');
const forecastsRoutes = require('./routes/forecasts');
const auditRoutes = require('./routes/audit');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const logsRoutes = require('./routes/logs');
const operatorRoutes = require('./routes/operator');
const simulatorRoutes = require('./routes/simulator');
const suppliersRoutes = require('./routes/suppliers'); // [NEW] Suppliers logic

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('/api/inventory', inventoryRoutes);
app.use('/api/anomalies', anomaliesRoutes);
app.use('/api/forecasts', forecastsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/simulation', simulatorRoutes); // [NEW] Mount simulator endpoints
app.use('/api/suppliers', suppliersRoutes); // [NEW] Mount suppliers endpoints

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
app.set('wss', wss); // [NEW] Save wss on app for access in routes
setSimulationWss(wss); // Ensure manual triggers can broadcast immediately

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`New WebSocket client connected from ${clientIp}`);

    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        payload: {
            message: 'Connected to Astratos server',
            timestamp: new Date().toISOString()
        }
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received:', data);

            ws.send(JSON.stringify({
                type: 'MESSAGE_RECEIVED',
                payload: data
            }));
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const startServer = async () => {
    try {
        try {
            await connectDB();
        } catch (dbError) {
            console.warn('MongoDB not available, running with mock data only');
        }

        server.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════╗
║                 ASTRATOS SERVER                   ║
╠═══════════════════════════════════════════════════╣
║  HTTP:      http://localhost:${PORT}                 ║
║  WebSocket: ws://localhost:${PORT}                   ║
║  Status:    RUNNING                               ║
╚═══════════════════════════════════════════════════╝
            `);

            startHeartbeat(wss, 2000);
            // startOperatorSimulation(); // Disabled auto-start so user can control via "Live Traffic" button
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const connectDB = require('./db/mongoConfig');
const { startHeartbeat } = require('./simulation/heartbeat');

// Route imports
const inventoryRoutes = require('./routes/inventory');
const anomaliesRoutes = require('./routes/anomalies');
const forecastsRoutes = require('./routes/forecasts');
const auditRoutes = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/anomalies', anomaliesRoutes);
app.use('/api/forecasts', forecastsRoutes);
app.use('/api/audit', auditRoutes);

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`New WebSocket client connected from ${clientIp}`);

    // Send initial connection message
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        payload: {
            message: 'Connected to Astratos server',
            timestamp: new Date().toISOString()
        }
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received:', data);

            // Echo back for testing
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

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB (optional - will work without it)
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

            // Start heartbeat simulation (push updates every 2 seconds)
            startHeartbeat(wss, 2000);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

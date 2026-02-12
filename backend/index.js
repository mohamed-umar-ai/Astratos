require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const connectDB = require('./database');
const apiRoutes = require('./routes/api');
const { startSimulation } = require('./simulator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        payload: { message: 'Connected to Astratos server', timestamp: new Date().toISOString() }
    }));

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
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
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`WebSocket server running on ws://localhost:${PORT}`);

            startSimulation(wss, 2000);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

const express = require('express');
const router = express.Router();
const { 
  startOperatorSimulation, 
  stopOperatorSimulation, 
  isSimulationRunning 
} = require('../simulation/operatorSimulation');

const Log = require('../models/Log');

router.get('/status', (req, res) => {
  res.json({
    success: true,
    isRunning: isSimulationRunning(),
    timestamp: new Date().toISOString()
  });
});

router.post('/start', async (req, res) => {
  try {
    if (isSimulationRunning()) {
      return res.status(400).json({ message: 'Simulation is already running' });
    }
    
    // Attempt to log Audit event
    await Log.create({
      type: 'Simulation Started',
      user: 'system',
      message: 'Operator simulation was started manually',
      details: { timestamp: new Date() }
    });

    const wss = req.app.get('wss');
    startOperatorSimulation(wss);
    res.json({ success: true, message: 'Simulation started successfully' });
  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/stop', async (req, res) => {
  try {
    if (!isSimulationRunning()) {
      return res.status(400).json({ message: 'Simulation is not running' });
    }

    // Attempt to log Audit event
    await Log.create({
      type: 'Simulation Stopped',
      user: 'system',
      message: 'Operator simulation was stopped manually',
      details: { timestamp: new Date() }
    });

    stopOperatorSimulation();
    res.json({ success: true, message: 'Simulation stopped successfully' });
  } catch (error) {
    console.error('Error stopping simulation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/trigger/order', async (req, res) => {
  const { generateAutoOrder, autoProgressOrdersToShipped } = require('../simulation/operatorSimulation');
  await generateAutoOrder();
  await autoProgressOrdersToShipped(true); // Force process all pending so Sales graph spikes instantly
  res.json({ success: true, message: 'Order trigger successful' });
});

router.post('/trigger/delivery', async (req, res) => {
  const { generateSupplierDelivery } = require('../simulation/operatorSimulation');
  await generateSupplierDelivery();
  res.json({ success: true, message: 'Delivery trigger successful' });
});

module.exports = router;

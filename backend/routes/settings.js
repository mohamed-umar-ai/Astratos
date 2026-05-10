const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const Log = require('../models/Log');
const { verifyToken, roleCheck } = require('../middleware/auth');
const { broadcast } = require('../simulation/operatorSimulation');

router.use(verifyToken, roleCheck('admin'));

router.get('/', async (req, res) => {
    try {
        const settingsList = await Setting.find();
        const configMap = {};
        settingsList.forEach(s => {
            configMap[s.section] = s.config;
        });
        res.json(configMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

const handleSettingUpdate = (settingType) => async (req, res) => {
    try {
        const section = settingType.toLowerCase();
        await Setting.findOneAndUpdate(
            { section },
            { config: req.body },
            { upsert: true, new: true }
        );
        
        await Log.create({ type: 'system', user: req.user.email, message: `Updated ${settingType} settings` });
        broadcast('SYSTEM_UPDATE');
        
        res.json({ message: `${settingType} settings saved successfully` });
    } catch (error) {
        console.error(`Error saving ${settingType} settings:`, error);
        res.status(500).json({ message: `Error saving ${settingType} settings` });
    }
};

router.post('/inventory', handleSettingUpdate('Inventory'));
router.post('/forecast', handleSettingUpdate('Forecast'));
router.post('/notifications', handleSettingUpdate('Notifications'));
router.post('/security', handleSettingUpdate('Security'));
router.post('/general', handleSettingUpdate('General'));

module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const Log = require('../models/Log');
const { verifyToken, roleCheck } = require('../middleware/auth');
const { validatePassword } = require('../middleware/validation');

router.use(verifyToken, roleCheck('admin'));

router.get('/users', async (req, res) => {
    try {
        // Exclude passwords from response
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/users', validatePassword, async (req, res) => {
    try {
        const { email, password, role, status = 'active' } = req.body;
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ email, password: hashedPassword, role, status });
        await newUser.save();
        
        await Log.create({ type: 'security', user: req.user.email, message: `Created new user: ${email}` });
        
        const userObj = newUser.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { role, email, status } = req.body;
        
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) return res.status(404).json({ message: 'User not found' });
        
        const updateData = { role, email, status };
        if (existingUser.role !== 'viewer' && role === 'viewer') {
            updateData.demotedToViewer = true;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        await Log.create({ type: 'security', user: req.user.email, message: `Updated user: ${user.email}` });
        
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});
router.put('/users/:id/promotion', async (req, res) => {
    try {
        const { approve } = req.body;
        const updateData = { promotionRequested: false };
        if (approve) {
            updateData.role = 'operator';
            updateData.justPromoted = true;
        } else {
            updateData.promotionRejected = true;
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        await Log.create({ type: 'security', user: req.user.email, message: `${approve ? 'Approved' : 'Rejected'} promotion for user: ${user.email}` });
        
        res.json(user);
    } catch (error) {
        console.error('Error handling promotion:', error);
        res.status(500).json({ message: 'Error handling promotion request' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            await Log.create({ type: 'security', user: req.user.email, message: `Deleted user: ${user.email}` });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;

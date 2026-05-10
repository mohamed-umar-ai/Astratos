const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Log = require('../models/Log');
const { verifyToken } = require('../middleware/auth');
const { validatePassword } = require('../middleware/validation');

const router = express.Router();

const requireDB = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database is not available. Please ensure MongoDB is running.' });
    }
    next();
};

router.post('/register', requireDB, validatePassword, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'viewer'
        });

        await user.save();

        await Log.create({ type: 'security', user: 'system', message: `New user registered: ${email.toLowerCase()}` });

        res.status(201).json({ message: 'Account created successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

router.post('/login', requireDB, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please sign up.' });
        }

        if (user.status === 'inactive') {
            await Log.create({ type: 'security', user: email.toLowerCase(), message: 'Failed login attempt: Account inactive' });
            return res.status(403).json({ message: 'Your account is deactivated. Please contact an administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await Log.create({ type: 'login', user: user.email, message: 'User logged in successfully' });

        res.json({ token, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ 
            email: req.user.email, 
            role: req.user.role, 
            justPromoted: user?.justPromoted || false, 
            promotionRejected: user?.promotionRejected || false,
            demotedToViewer: user?.demotedToViewer || false
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

router.post('/request-promotion', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'viewer') {
            return res.status(400).json({ message: 'Only viewers can request promotion.' });
        }
        await User.findByIdAndUpdate(req.user.id, { promotionRequested: true });
        await Log.create({ type: 'security', user: req.user.email, message: 'User requested promotion to operator' });
        res.json({ message: 'Promotion request sent to administrators.' });
    } catch (error) {
        console.error('Promotion request error:', error);
        res.status(500).json({ message: 'Error submitting request.' });
    }
});

router.post('/acknowledge-promotion', verifyToken, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { 
            justPromoted: false, 
            promotionRejected: false,
            demotedToViewer: false
        });
        res.json({ message: 'Notifications acknowledged.' });
    } catch (error) {
        console.error('Acknowledge promotion error:', error);
        res.status(500).json({ message: 'Error acknowledging promotion.' });
    }
});

module.exports = router;


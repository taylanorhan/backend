// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    // For simplicity, let's assume req.user contains user info and has an isAdmin property
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}

// Route to get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to get all orders
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

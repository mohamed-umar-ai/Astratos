const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String }
    },
    items: [{
        product: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    status: {
        type: String,
        enum: ['pending', 'processed', 'shipped', 'rejected'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

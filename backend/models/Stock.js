const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    threshold: { type: Number, required: true, default: 10 },
    department: { type: String, required: true },
    price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);

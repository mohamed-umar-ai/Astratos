const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    carrier: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'in transit', 'delivered', 'exception'],
        default: 'pending'
    },
    destination: { type: String, required: true },
    estimatedDelivery: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);

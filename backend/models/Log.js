const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true,
        enum: ['inventory', 'forecast', 'notifications', 'security', 'general']
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    deviceId: String,
    fcmId: String
}, {timestamps: true})

module.exports = mongoose.model('Device', schema);

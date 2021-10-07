const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    description: String,
    icon: String
}, {timestamps: true})

module.exports = mongoose.model('Category', schema);

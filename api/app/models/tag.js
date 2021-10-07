const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    tag: {
        type: String,
        maxlength: 15,
        lowercase: true,
        unique: true
    }
})

const Tag = mongoose.model('Tag', schema);

module.exports = Tag
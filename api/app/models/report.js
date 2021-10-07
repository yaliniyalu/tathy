const mongoose = require('mongoose');
const {isEmail} = require("validator");

const schema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            isAsync: true,
            validator: validateEmail,
            message: "Invalid Email"
        }
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    report: String,
    status: { type: String, enum: ['Pending', 'Resolved', 'Rejected'], default: 'Pending' },
    statusChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusChangedAt: Date,
    actionTaken: String,
    notes: String,
}, {timestamps: true})

async function validateEmail(email) {
    if (!isEmail(email)) {
        return Promise.reject(new Error('Enter valid Email Id'))
    }
    return true;
}

module.exports = mongoose.model('Report', schema);

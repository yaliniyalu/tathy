const mongoose = require('mongoose');
const {isEmail} = require("validator");

const schema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate: {
            validator: isEmail,
            message: "Invalid Email"
        }
    },
    type: {
        type: String,
        enum: ['Password Reset']
    },
    code: {
        type: Number,
        required: true
    },
    retryCount: {
        type: Number,
        default: 0
    },
    lastRetryAt: {
        type: Number,
    },
    expiresOn: {
        type: Number,
        required: true
    },
}, { timestamps: true })

schema.statics.generateOtp = async function (email, type) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const expiresOn = Math.floor(Date.now() / 1000) + (60 * 15); // 15 minutes

    const otp = await Otp.findOne({ email, type }).exec()
    if (!otp) {
        const otp = new Otp({ email, type, code, expiresOn })
        await otp.save()
        return otp
    }

    otp.code = code;
    otp.expiresOn = expiresOn;
    otp.retryCount = 0;
    await otp.save()
    return otp;
}

schema.statics.verifyOtp = async function (email, type, code) {
    /** @type Otp */
    const otp = await Otp.findOne({ email, type }).exec()
    if (!otp) {
        return Promise.reject("Otp Not found");
    }

    if (otp.expiresOn < (Date.now() / 1000)) {
        return Promise.reject("Otp Expired")
    }

    if (otp.retryCount >= 5) {
        if ((otp.lastRetryAt + (Date.now() / 1000) + (60 * 30))  < (Date.now() / 1000)) { // 30 min
            otp.retryCount = 0;
        } else {
            return Promise.reject("Max retry count exceeded. Try again after 30 minutes.")
        }
    }

    if (otp.code === code) {
        await otp.delete()
        return otp
    }

    otp.retryCount ++;
    otp.lastRetryAt = Date.now()

    await otp.save()
    return Promise.reject("Invalid Otp")
}

const Otp = mongoose.model('Otp', schema);

module.exports = Otp
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {UserRoleEnum} = require("../enums");
const {isEmail} = require('validator');
const fs = require("fs");
const SALT_WORK_FACTOR = 10;

const Schema = mongoose.Schema;

async function validateEmail(email) {
    if (!isEmail(email)) {
        return Promise.reject(new Error('Enter valid Email Id'))
    }

    const user = await this.constructor.findOne({ email });
    if (user) {
        if (this.id === user.id) {
            return true
        } else {
            return Promise.reject(new Error('Email Id already registered'))
        }
    }
    return true;
}

const schema = new Schema({
    name:  { type: String, required: true, trim: true },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'Email address is required'],
        validate: {
            isAsync: true,
            validator: validateEmail,
            message: "Invalid Email"
        }
    },
    image: {
        type: String,
        required: false,
        set: function(name) {
            if (name !== this.image) {
                this._previousImage = this.image;
            }
            return name;
        }
    },
    password:  { type: String, required: true, minlength: 6 },
    role:      { type: String, required: true, enum: Object.values(UserRoleEnum), default: UserRoleEnum.USER },

}, { timestamps: true, authors: 'User' })

// Hash Password
schema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Upload Image
schema.pre("save", function (next) {
    if (!this.isModified("image")) {
        return next()
    }

    fs.rename(process.env.UPLOAD_DIR + "/temp/" + this.image, process.env.UPLOAD_DIR + "/users/" + this.image, (err) => {
        next(err)
    })
})

schema.post('save', function () {
    if (this._previousImage) {
        fs.unlink(process.env.UPLOAD_DIR + "/users/" + this._previousImage, () => {})
    }
});

schema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', schema);

module.exports = User

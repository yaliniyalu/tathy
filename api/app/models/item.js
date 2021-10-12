const mongoose = require('mongoose');
const fs = require("fs");
const bcrypt = require("bcrypt");
const {renderSvg, renderWatermark} = require("../render");
const Tag = require("./tag");

const schema = new mongoose.Schema({
    index: Number,
    type: String,
    text: String,
    image: {
        type: String,
        set(value) {
            if (value !== this.image) {
                this._prevImage = this.image;
            }
            return value;
        }
    },
    tags: [String],
    notes: String,
    renderedSvg: String,

    style: {
        image: {
            type: String,
            set(value) {
                if (value !== this.style.image) {
                    this._prevStyleImage = this.image;
                }
                return value;
            }
        },
        imageHeight: Number,
        hasSeparator: Boolean,
        fontFamily: String,
        themeColor: String,
    },

    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    statusChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusChangedAt: Date,
    rejectedReason: String
}, {timestamps: true, authors: 'User'});

schema.methods.isApproved = function() {
    return this.status === 'Approved';
};

// Upload Image
schema.pre("save", function (next) {
    if (!(this.isModified("image") || this.isModified("style.image"))) {
        return next()
    }

    try {
        if (this.image === this.style.image) {
            fs.renameSync(process.env.UPLOAD_DIR + "/temp/" + this.image, process.env.UPLOAD_DIR + "/items/" + this.image)
            fs.copyFileSync(process.env.UPLOAD_DIR + "/items/" + this.image, process.env.UPLOAD_DIR + "/items/cropped/" + this.image)
            return next()
        }

        if (this.isModified("image")) {
            fs.renameSync(process.env.UPLOAD_DIR + "/temp/" + this.image, process.env.UPLOAD_DIR + "/items/" + this.image)
        }

        if (this.isModified("style.image")) {
            fs.renameSync(process.env.UPLOAD_DIR + "/temp/" + this.style.image, process.env.UPLOAD_DIR + "/items/cropped/" + this.style.image)
        }
    } catch (e) {
        next(e)
    }

    return next()
})

// svg
schema.pre("save", function (next) {
    if (!this.isModified('renderedSvg')) return next()

    this.renderedSvg = this.renderedSvg.replace(`href="${process.env.APP_URL}/uploads/temp/${this.style.image}`, `href="${process.env.APP_URL}/uploads/items/cropped/${this.style.image}`)

    const sizes = [200, 320, 480, 720, 960, 1280]
    renderSvg(this.renderedSvg, sizes, process.env.UPLOAD_DIR + "/items/rendered/" + this._id)
        .then(() => {
            renderWatermark(
                process.env.UPLOAD_DIR + "/items/rendered/" + this._id + "_720.jpg",
                process.env.STATIC_DIR + "/logo_white.png",
                process.env.UPLOAD_DIR + "/items/rendered/shared/" + this._id + "_720.jpg"
            )
                .then(() => next())
                .catch(e => next(e))
        })
        .catch(e => next(e));
})

schema.post('deleteOne', function () {
    if (this.image) {
        fs.unlink(process.env.UPLOAD_DIR + "/items/" + this.image, () => {})
    }

    if (this.style.image) {
        fs.unlink(process.env.UPLOAD_DIR + "/items/cropped/" + this.style.image, () => {})
    }
})

schema.post('save', function () {
    if (this._prevStyleImage) {
        fs.unlink(process.env.UPLOAD_DIR + "/items/cropped/" + this._prevStyleImage, () => {})
    }

    if (this._prevImage) {
        fs.unlink(process.env.UPLOAD_DIR + "/items/" + this._prevImage, () => {})
    }

    if (this.tags.length) {
        Tag.bulkWrite(this.tags.map(tag => ({
            updateOne: {
                filter: { tag: tag.toLowerCase() },
                update: { tag: tag.toLowerCase() },
                upsert: true
            }
        }))).then()
    }
})

module.exports = mongoose.model('Item', schema);

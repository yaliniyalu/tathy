const mongoose = require('mongoose');
const fs = require("fs");
const bcrypt = require("bcrypt");
const renderSvg = require("../render-svg");

const schema = new mongoose.Schema({
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

    likes: Number,
    views: Number,

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

/*schema.post('save', function () {
    if (this._prevImage) {
        fs.unlink(process.env.UPLOAD_DIR + "/items/" + this._prevImage, () => {})
    }

    if (this._prevStyleImage) {
        fs.unlink(process.env.UPLOAD_DIR + "/items/cropped/" + this._prevStyleImage, () => {})
    }
});*/

// svg
schema.pre("save", function (next) {
    if (!this.isModified('renderedSvg')) return next()

    this.renderedSvg = this.renderedSvg.replace(`href="${process.env.APP_URL}/uploads/temp/${this.style.image}`, `href="${process.env.APP_URL}/uploads/items/cropped/${this.style.image}`)

    const sizes = [200, 320, 480, 720, 960, 1280]
    renderSvg(this.renderedSvg, sizes, process.env.UPLOAD_DIR + "/items/rendered/" + this._id)
        .then(() => next())
        .catch(e => next(e));

    const svg = this.renderedSvg.replace("</svg>", `
        <g>
           <text font-size="44" font-family="Fleur De Leah" font-weight="bold" x="20" y="55">
              <tspan fill="#26A69A80">T</tspan><tspan fill="#CD5C5C80">athy</tspan>
           </text>
        </g>
    `) + "</svg>"

    renderSvg(svg, [720], process.env.UPLOAD_DIR + "/items/rendered/shared/" + this._id)
        .then(() => next())
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

module.exports = mongoose.model('Item', schema);

const mongoose = require('mongoose');
const fs = require("fs");
const Tag = require("./tag");

const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, required: true, trim: true },
    image: {
        type: String,
        required: true,
        set: function(name) {
            if (name !== this.image) {
                this._previousImage = this.image;
            }
            return name;
        }
    },
    description: { type: String, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String, trim: true }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    purchase: {
        amount: { type: Number, default: 0 },
        sku: { type: String, default: null }
    },
    status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Disabled' },
    statusChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusChangedAt: Date,
}, { timestamps: true, authors: 'User' })

schema.methods.addItem = function(item) {
    if(this.items.indexOf(item) === -1) {
        this.items.push(item);
    }
};

schema.methods.isEnabled = function() {
    return this.status === 'Enabled'
};

schema.methods.getItemCountByStatus = function (status) {

}

// Upload Image
schema.pre("save", function (next) {
    if (!this.isModified("image")) {
        return next()
    }

    fs.rename(process.env.UPLOAD_DIR + "/temp/" + this.image, process.env.UPLOAD_DIR + "/packs/" + this.image, (err) => {
        next(err)
    })
})

schema.post('save', function () {
    if (this._previousImage) {
        fs.unlink(process.env.UPLOAD_DIR + "/packs/" + this._previousImage, () => {})
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
});

const Pack = mongoose.model('Pack', schema);

module.exports = Pack

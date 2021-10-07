const mongoose = require('mongoose');

module.exports = function authorsPlugin(schema) {

    schema.methods.setAuthor = function (id) {
        this.__author = id;
    }

    if (schema.options.authors) {
        schema.add({
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: schema.options.authors
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: schema.options.authors
            }
        })

        schema.pre("save", function (next) {
            if (!this.__author) return next();

            this.updatedBy = this.__author
            if (this.isNew) {
                this.createdBy = this.__author
            }

            next()
        })
    }
};

const mongoose = require("mongoose");

mongoose.plugin(require('../app/plugins/authors'));

mongoose.connect(process.env.MONGODB_URI).then(
    () => {console.log("database connected")},
    err => {
        console.error("database connection failed", err)
        process.exit()
    }
);

module.exports = mongoose;

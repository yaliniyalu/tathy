const mongoose = require("mongoose");
const {User} = require("../app/models");

mongoose.plugin(require('../app/plugins/authors'));

mongoose.connect(process.env.MONGODB_URI).then(
    () => {console.log("database connected")},
    err => {
        console.error("database connection failed", err)
        process.exit()
    }
);

let user = User.findOne()
if (!user) {
    /** @yype User */
    const user = new User()
    user.name = "Admin"
    user.email = "admin@example.com"
    user.password = "123456"
    user.role = "Admin"
    user.save().then()
}

module.exports = mongoose;

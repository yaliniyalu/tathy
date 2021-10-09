require('./db')
const {User} = require("../app/models");

const user = new User()
user.name = "Admin"
user.email = "admin@yalusoft.com"
user.password = "123456"
user.role = "Admin"

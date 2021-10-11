require('dotenv').config()

require('./db')
const {User, FactType} = require("../app/models");

const user = new User()
user.name = "Admin"
user.email = "admin@yalusoft.com"
user.password = "123456"
user.role = "admin"
user.save().then()


const factTypes = ['Fact', 'Fun Fact', 'Did You Know', 'Psychology Fact']
factTypes.forEach(v => {
    FactType.findOne({ name: 'Fact' }).exec().then(v => {
        if (!v) {
            const f = new FactType({name: v})
            f.save().then()
        }
    })
})

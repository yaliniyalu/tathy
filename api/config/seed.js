require('dotenv').config()

require('./db')
const {User, FactType} = require("../app/models");

const email = "admin@yalusoft.com";

User.findOne({email}).exec().then(u => {
    if (u) return;

    const user = new User()
    user.name = "Admin"
    user.email = email
    user.password = "123456"
    user.role = "admin"
    user.save().then()
}).catch(e => console.log("User Insertion Failed", e.message))


const factTypes = ['Fact', 'Fun Fact', 'Did You Know', 'Psychology Fact']
factTypes.forEach(name => {
    FactType.findOne({ name }).exec().then(v => {
        if (!v) {
            const f = new FactType({name})
            f.save().then()
        }
    })
})

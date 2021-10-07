const adminRoute = require("./admin")
const appRoute = require("./client-app")

function routes(app) {
    adminRoute(app)
    appRoute(app)
}

module.exports = routes

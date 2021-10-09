const {AppController} = require("../../app/controllers");

function routes(app) {
    const router = require('express').Router();

    router.get('/items', AppController.getItems)
    router.get('/tags', AppController.getTags)
    router.post('/item/:id/report', AppController.reportItem)
    router.patch('/fcm', AppController.updateFcmId)

    app.use('/api', router);
}


module.exports = routes

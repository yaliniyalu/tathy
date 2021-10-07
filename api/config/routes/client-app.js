const {AppController, TagController} = require("../../app/controllers");

function routes(app) {
    const router = require('express').Router();

    router.post('/packs/search', AppController.searchPacks)
    router.get('/pack/:id', AppController.getPack)
    router.get('/pack/:id/items', AppController.getItems)
    router.get('/pack/:id/related', AppController.getRelatedPacks)
    router.post('/item/:id/report', AppController.reportItem)
    router.patch('/fcm', AppController.updateFcmId)

    router.get('/category/sample', AppController.listCategoryWithSample)
    router.get('/category', TagController.listCategory)
    router.get('/category/:id/packs', AppController.listPacksByCategory)
    router.get('/packs/search/suggestions', AppController.packSearchSuggestions)

    app.use('/api', router);
}


module.exports = routes

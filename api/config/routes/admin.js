const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const {AuthController, UploadController, UserController, PackController, TagController, ItemController,
    ReportController
} = require("../../app/controllers");

function routes(app) {
    const routerNoToken = require('express').Router();
    const router = require('express').Router();

    router.get('/auth/me', AuthController.getMe);
    routerNoToken.post('/auth/login', AuthController.login);
    routerNoToken.post('/auth/recover-password', AuthController.forgetPasswordVerifyEmail);
    routerNoToken.get('/auth/recover-password/verify', AuthController.forgetPasswordVerifyOtp);
    routerNoToken.post('/auth/recover-password/change', AuthController.forgetPasswordChange);


    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.UPLOAD_DIR  + '/temp/')
        },
        filename: function (req, file, cb) {
            cb(null, uuid.v4() + path.extname(file['originalname']))
        }
    })

    const upload = multer({ storage: storage })

    router.post('/upload', upload.single('file'), UploadController.upload)
    router.delete('/upload', UploadController.remove)

    router.get('/user', UserController.listAll)
    router.get('/user/:id', UserController.get)
    router.post('/user', UserController.add)
    router.patch('/user/:id', UserController.update)

    router.get('/pack', PackController.listAll)
    router.get('/pack/:id', PackController.get)
    router.post('/pack', PackController.add)
    router.patch('/pack/:id', PackController.update)

    router.patch('/pack/:id/status', PackController.updateStatus)

    routerNoToken.get('/tags', TagController.listAll)
    routerNoToken.get('/category', TagController.listCategory)

    // Item
    router.post('/pack/:pack/item/:item?', ItemController.save)
    router.post('/item/:item', ItemController.save)
    router.get('/item/:item', ItemController.get)
    router.patch('/item/:item/status', ItemController.updateStatus)
    router.delete('/item/:item', ItemController.deleteItem)

    // Report
    router.get('/reports', ReportController.listAll)
    router.patch('/report/:id/status', ReportController.updateStatus)
    router.patch('/report/:id/notes', ReportController.updateNotes)

    app.use('/api/admin', routerNoToken);
    app.use('/api/admin', AuthController.adminAuthMiddleware, router);
}


module.exports = routes

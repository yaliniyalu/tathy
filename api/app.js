const express = require('express')
const nunjucks = require("nunjucks");
const bodyParser = require('body-parser');
const cors = require("cors");

require('dotenv').config();

require('./config/boot')
require('./config/db')
const errorHandler = require("./app/middlewares/error-handler");

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())

app.use('/uploads', express.static(process.env.UPLOAD_DIR));

app.use(errorHandler)

const httpServ = require('http').createServer(app);

nunjucks.configure("./app/views", {
    autoescape: true,
    express: app
})
app.set('view engine', 'njk');


const routes = require("./config/routes")
routes(app)

const listener = httpServ.listen(process.env.APP_PORT, () => {
    console.log("Your app is listening on port http://localhost:" + listener.address().port + "/");
});

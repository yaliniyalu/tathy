const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");

function errorHandler (err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }

    return res
        .status(StatusCodes.BAD_REQUEST)
        .json(Response.error(err.message ?? "Internal Server Error", null, 500))
}

module.exports = errorHandler
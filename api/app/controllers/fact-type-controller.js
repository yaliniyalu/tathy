const {FactType} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");

/** @type {ExpressRequestHandler} */
const listFactTypes = async (req, res) => {
    try {
        const types = await FactType.find().sort({ name: 1 }).exec()
        return res.json(Response.success({ types }))
    } catch (e) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Response.error("Database error"))
    }
}

/** @type {ExpressRequestHandler} */
const addFactType = async (req, res) => {
    const name = req.body.type

    if (!name) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Type is required"))
    }

    try {
        const factType = new FactType({ name })
        await factType.save()
    } catch (e) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Response.error(e.message))
    }

    return res
        .status(StatusCodes.OK)
        .json(Response.success())
}

/** @type {ExpressRequestHandler} */
const deleteFactType = async (req, res) => {
    const name = req.params.type

    try {
        const factType = await FactType.findOne({ name }).exec();
        factType.delete()
    } catch (e) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Response.error(e.message))
    }

    return res
        .status(StatusCodes.OK)
        .json(Response.success())
}

module.exports = {
    listFactTypes,
    addFactType,
    deleteFactType
}

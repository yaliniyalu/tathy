const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");
const {Category, Tag} = require("../models");

/** @type {ExpressRequestHandler} */
const listAll = async (req, res) => {
    try {
        const tags = await Tag.find().exec()
        return res.json(Response.success({ tags }))
    } catch (e) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Response.error("Database error"))
    }
}

const listCategory = async (req, res) => {
    const category = await Category.find().exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ category }))
}

module.exports = {
    listAll,
    listCategory
}

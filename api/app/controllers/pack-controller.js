const {Pack} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");
const Joi = require("joi");

/** @type {ExpressRequestHandler} */
const get = async (req, res) => {
    const id = req.params.id
    const populate = req.query.populate?.replace(/\)$/, "").split('),').map(v => v.trim().split('(').map(v => v.replaceAll("," , " "))) ?? []

    try {
        const query = Pack.findById(id);
        populate.forEach(v => query.populate(v[0], v[1] ?? undefined))
        const pack = await query.exec()

        return res.json(Response.success({ pack }))
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }
}

/** @type {ExpressRequestHandler} */
const add = async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().required(),
        image: Joi.string().required(),
        description: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).optional().default([]),
        category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate(req.body);
    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const pack = new Pack(value)
    pack.setAuthor(req['userId'])

    try {
        await pack.save()
        return res.json(Response.success({ pack }))
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }
}

/** @type {ExpressRequestHandler} */
const listAll = async (req, res) => {
    const populate = req.query.populate?.replace(/\)$/, "").split('),').map(v => v.split('(').map(v => v.replace("," , " "))) ?? []

    try {
        const query = Pack.find();
        populate.forEach(v => query.populate(v[0], v[1] ?? undefined))
        const packs = await query.exec()
        return res.json(Response.success({ packs }))
    } catch (e) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Response.error("Database error"))
    }
}

/** @type {ExpressRequestHandler} */
const update = async (req, res) => {
    const id = req.params.id

    const schema = Joi.object({
        name: Joi.string().optional(),
        image: Joi.string().optional(),
        description: Joi.string().optional(),
        tags: Joi.array().items(Joi.string()).optional().default([]),
        category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate(req.body);
    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    try {
        const pack = await Pack.findById(id).exec()
        if (!pack) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(Response.error("Pack not found"))
        }

        pack.set(value)
        await pack.save()
        return res.json(Response.success({ pack }))
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }
}


/** @type {ExpressRequestHandler} */
const updateStatus = async (req, res) => {
    const id = req.params.id
    const status = req.body.status

    if (!['Enabled', 'Disabled'].includes(status)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Invalid status"))
    }

    /** @type {Pack} */
    let pack = await Pack.findById(id).exec();
    if (!pack) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json(Response.error("Pack not found"))
    }

    pack.status = status
    pack.statusChangedBy = req['userId']
    pack.statusChangedAt = Date.now()

    await pack.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ pack }))
}


module.exports = {
    get,
    add,
    listAll,
    update,
    updateStatus
}

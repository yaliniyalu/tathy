const {Item, Report, Device, Tag} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");
const Joi = require("joi");

/** @type {ExpressRequestHandler} */
const getTags = async (req, res) => {

    const schema = Joi.object({
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        q: Joi.string().optional()
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate(req.query);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const agg = Tag.aggregate()

    if (value.q) {
        agg.match({tag: {$regex: `^${value.q}`, $options: 'i'}})
    }

    if (value.skip) agg.skip(value.skip)
    if (value.limit) agg.limit(value.limit)

    agg.lookup({
        from: 'items',
        localField: 'tag',
        foreignField: 'tags',
        as: 'items',
        pipeline: Item.aggregate()
            .match({status: 'Approved'})
            .project("_id")
            .pipeline()
    })
        .addFields({ items: {$size: "$items"} })
        .unwind('items')
        .sort({ items: -1 })

    const tags = await agg.exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ tags: tags ?? [] }))
}

/** @type {ExpressRequestHandler} */
const getItems = async (req, res) => {
    const schema = Joi.object({
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        fromIndex: Joi.number().optional(),
        tag: Joi.string().optional(),
        withCount: Joi.boolean().optional().default(false)
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate(req.query);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const match = {status: 'Approved'};
    if (value.tag) {
        match.tags = value.tag
    }

    if (value.fromIndex) {
        match.index = { $gte: value.fromIndex }
    }

    const agg = Item.aggregate()
        .match(match)
        .project("_id text type index")
        .sort({ index: 1 });

    if (value.skip) agg.skip(value.skip)
    if (value.limit) agg.limit(value.limit)

    const items = (await agg.exec()) ?? []

    let count = 0;
    if (value.withCount) {
        const match = {status: 'Approved'};
        if (value.tag) {
            match.tags = value.tag
        }
        count = await Item.count(match).exec()
    }

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ items, count }))
}

/** @type {ExpressRequestHandler} */
const reportItem = async (req, res) => {
    const schema = Joi.object({
        item: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        email: Joi.string().email().optional(),
        report: Joi.string().max(2500).required()
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate({...req.body, item: req.params.id});

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const report = new Report(value)
    await report.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success())
}

/** @type {ExpressRequestHandler} */
const updateFcmId = async (req, res) => {
    let deviceId = req.body.deviceId
    let fcm = req.body.fcmId

    if (!fcm) fcm = null

    /** @type Device */
    let device = null
    if (deviceId) {
        device = Device.findById(deviceId)
    }

    if (!deviceId) {
        device = new Device()
    }

    device.fcmId = fcm
    await device.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ deviceId: device._id, fcmId: device.fcmId }))
}

module.exports = {
    getItems,
    getTags,
    reportItem,
    updateFcmId,
}

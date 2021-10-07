const {Pack, Item, Report, Device, User, Category} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");
const Joi = require("joi");
const mongoose = require("mongoose");


/** @type {ExpressRequestHandler} */
const searchPacks = async (req, res) => {
    const sortField = ['name', 'createdAt', 'updatedAt']
    const selectField = ['name', 'image', 'description', 'category', 'tags', 'items', 'purchase', 'createdAt', 'updatedAt', 'createdBy']

    const schema = Joi.object({
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        sort: Joi.array().items(Joi.object().pattern(Joi.string().valid(...sortField), Joi.number())).optional().default({name: 1}),
        q: Joi.string().optional(),
        fields: Joi.array().items(Joi.string().valid(...selectField)).optional().default(selectField)
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate({...req.query, pack: req.params.id});

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const agg = Pack.aggregate()

    if (value.q) {
        agg.match({
            $and: [
                {
                    status: "Approved"
                },
                {
                    $or: [
                        {name: { $regex: `^${value.q}`, $options: 'i' }},
                        {name: { $regex: ` ${value.q}`, $options: 'i' }}
                    ]
                }
            ]
        })
    }
    if (value.fields?.length) agg.project(value.fields.join(' '))

    agg.lookup({
        from: 'items',
        localField: 'items',
        foreignField: '_id',
        as: 'items',
        pipeline: Item.aggregate()
            .match({status: {$eq: 'Approved'}})
            .project("_id")
            .pipeline()
    })
        .addFields({ items: {$size: "$items"} })
        .match({ items: { $gt: 0}})

    if (value.skip) agg.skip(value.skip)
    if (value.limit) agg.limit(value.limit)
    if (value.sort) agg.sort(value.sort)

    if (selectField.includes('category')) {
        agg.lookup({
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
        })
    }

    const packs = await agg.exec()
    return res
        .status(StatusCodes.OK)
        .json(Response.success({ packs }))
}

/** @type {ExpressRequestHandler} */
const listCategoryWithSample = async (req, res) => {
    const schema = Joi.object({
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        sampleSize: Joi.number().optional().default(10)
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate({...req.query, pack: req.params.id});

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const agg = Category.aggregate()
        .lookup({
            from: 'packs',
            localField: "_id",
            foreignField: "category",
            as: "packs",
            pipeline: Pack.aggregate()
                .limit(value.sampleSize)
                .lookup({
                    from: 'items',
                    localField: 'items',
                    foreignField: '_id',
                    as: 'items',
                    pipeline: Item.aggregate()
                        .match({status: {$eq: 'Approved'}})
                        .project("_id")
                        .pipeline()
                })
                .project({name: true, image: true, purchase: true, items: {$size: "$items"}})
                .match({ items: { $gt: 0}})
                .pipeline()
        })
        .match({
            $nor: [
                {packs: {$exists: false}},
                {packs: {$size: 0}},
            ]
        })

    if (value.limit) agg.limit(value.limit)
    if (value.skip) agg.skip(value.skip)

    const sample = await agg.exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ sample }))
}

/** @type {ExpressRequestHandler} */
const getPack = async (req, res) => {
    const id = req.params.id

    const fields = ['name', 'description', 'image', 'tags', 'purchase', 'status', 'createdBy', 'createdAt', 'category']

    try {
        const query = Pack.findById(id, fields.join(' '));
        query.populate('createdBy', 'name')
        query.populate('items', '_id', Item, { status: {$eq: 'Approved'} })
        query.populate('category')

        /** @type Pack */
        const pack = await query.exec()

        if (!pack || !pack.isEnabled() || pack.items.length <= 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(Response.error("Pack not found"))
        }

        const obj = pack.toObject()
        obj.itemsCount = pack.items.length
        delete obj['items']

        return res.json(Response.success({ pack: obj }))
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }
}

/** @type {ExpressRequestHandler} */
const getRelatedPacks = async (req, res) => {
    const id = req.params.id

    const pack = await Pack.findById(id)

    const agg = Pack.aggregate()
        .match({tags: { $in: pack.tags }}) // todo enabled
        .lookup({
            from: 'items',
            localField: 'items',
            foreignField: '_id',
            as: 'items',
            pipeline: Item.aggregate()
                .match({status: {$eq: 'Approved'}})
                .project("_id")
                .pipeline()
        })
        .addFields({ items: {$size: "$items"} })
        .match({ items: { $gt: 0}})
        .project({name: true, image: true, purchase: true, items: true, matchedTags: { $size: { $setIntersection: ["$tags", pack.tags]}}})
        .sort({ matchedTags: -1 })
        .limit(10)

    const packs = await agg.exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ packs }))
}

/** @type {ExpressRequestHandler} */
const getItems = async (req, res) => {

    const schema = Joi.object({
        pack: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        limit: Joi.number().optional(),
        skip: Joi.number().optional()
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate({...req.query, pack: req.params.id});

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const itemAgg = Item.aggregate()
        .match({status: {$eq: 'Approved'}})
        .project("_id text type renderedSvg")
        .sort({ createdAt: -1 });

    if (value.limit) itemAgg.limit(value.limit)
    if (value.skip) itemAgg.skip(value.skip)

    const query = Pack.aggregate()
        .match({ _id: {$eq: mongoose.Types.ObjectId(value.pack)} })
        .project("_id items")
        .lookup({
            from: 'items',
            localField: 'items',
            foreignField: '_id',
            as: 'items',
            pipeline: itemAgg.pipeline()
        })

    const pack = await query.exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ items: pack[0]?.items ?? [] }))
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

/** @type {ExpressRequestHandler} */
const listPacksByCategory = async (req, res) => {
    const schema = Joi.object({
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate({...req.query, category: req.params.id});

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const agg = Pack.aggregate()
        .match({category: { $eq: mongoose.Types.ObjectId(value.category) }}) // todo enabled
        .lookup({
            from: 'items',
            localField: 'items',
            foreignField: '_id',
            as: 'items',
            pipeline: Item.aggregate()
                .match({status: {$eq: 'Approved'}})
                .project("_id")
                .pipeline()
        })
        .addFields({ items: {$size: "$items"} })
        .match({ items: { $gt: 0}})
        .project({name: true, image: true, purchase: true, items: true, createdAt: true})
        .sort({ createdAt: -1 });

    if (value.limit) agg.limit(value.limit)
    if (value.skip) agg.skip(value.skip)

    const packs = await agg.exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ packs }))
}


/** @type {ExpressRequestHandler} */
const packSearchSuggestions = async (req, res) => {
    const schema = Joi.object({
        q: Joi.string().required(),
    }).options({stripUnknown: true});

    const {value, error} = schema.validate(req.query);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const agg = Pack.aggregate() // todo enabled
        .match({
            $or: [
                {name: {$regex: `^${value.q}`, $options: 'i'}},
                {name: {$regex: ` ${value.q}`, $options: 'i'}}
            ]
        })
        .project({name: true})
        .sort({name: 1})
        .limit(25);

    const suggestions = await agg.exec()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({suggestions}))
}


module.exports = {
    searchPacks,
    getPack,
    getItems,
    reportItem,
    updateFcmId,
    listCategoryWithSample,
    getRelatedPacks,
    listPacksByCategory,
    packSearchSuggestions
}

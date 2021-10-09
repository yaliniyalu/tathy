const {Item} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");
const Joi = require('joi');

/** @type {ExpressRequestHandler} */
const save = async (req, res) => {
    const schema = Joi.object({
        text: Joi.string().allow(null).required(),
        type: Joi.string().allow(null).required(),
        image: Joi.string().allow(null).required(),
        style: Joi.object({
            image: Joi.string().allow(null).required(),
            imageHeight: Joi.number().required(),
            hasSeparator: Joi.boolean().required(),
            fontFamily: Joi.string().required(),
            themeColor: Joi.string().required(),
        }),
        notes: Joi.string().optional().default(null),
        tags: Joi.array().items(Joi.string()).optional().default([]),
        renderedSvg: Joi.string().required(),
    }).options({ stripUnknown: true });


    const {value, error} = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const paramsSchema = Joi.object({
        item: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    }).options({ stripUnknown: true })

    const valid = paramsSchema.validate(req.params);

    if (valid.error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(valid.error.details[0].message, valid.error.details[0]))
    }

    const params = valid.value

    let item;
    if (params.item) {
        item = await Item.findById(params.item).exec()
        if (!item) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(Response.error("Item not found", null, 404))
        }
        item.set(value)
    } else {
        item = new Item(value)
    }

    if (!params.item) { // auto approve
        item.status = 'Approved'
        item.statusChangedBy = req['userId']
        item.statusChangedAt = Date.now()
    }

    const count = await Item.count().exec()
    item.index = count + 1

    item.setAuthor(req['userId'])

    await item.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ item }))
}

/** @type {ExpressRequestHandler} */
const get = async (req, res) => {
    const id = req.params.item
    const populate = req.query.populate?.replace(/\)$/, "").split('),').map(v => v.trim().split('(').map(v => v.replaceAll("," , " "))) ?? []

    try {
        const query = Item.findById(id);
        populate.forEach(v => query.populate(v[0], v[1] ?? undefined))
        const item = await query.exec()

        return res.json(Response.success({ item }))
    } catch (e) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json(Response.error(e.message))
    }
}

/** @type {ExpressRequestHandler} */
const updateStatus = async (req, res) => {
    const id = req.params.item
    const status = req.body.status

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Invalid status"))
    }

    if (status === 'Rejected' && !req.body.reason) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Reason is required"))
    }

    /** @type {Item | null} */
    let item = null
    try {
        item = await Item.findById(id).exec();
    } catch (e) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json(Response.error(e.message))
    }

    item.status = status
    item.statusChangedBy = req['userId']
    item.statusChangedAt = Date.now()

    if (status === 'Rejected') {
        item.rejectedReason = req.body.reason
    }

    await item.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ item }))
}

/** @type {ExpressRequestHandler} */
const deleteItem = async (req, res) => {
    const id = req.params.item

    try {
        const item = await Item.findById(id).exec();
        item.delete()
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
const listItems = async (req, res) => {
    const sortField = ['index', 'createdAt', 'status']
    const populateFields = ['statusChangeBy', 'updatedBy', 'createdBy']

    const schema = Joi.object({
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        sort: Joi.object().pattern(Joi.string().valid(...sortField), Joi.number().valid(1, -1)).optional().default({createdAt: -1}),
        populate: Joi.array().items(Joi.string().valid(...populateFields)).optional().default(populateFields),
        q: Joi.string().optional(),
        status: Joi.string().optional()
    }).options({ stripUnknown: true });

    const {value, error} = schema.validate({...req.body});

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.details[0].message, error.details[0]))
    }

    const agg = Item.aggregate()
    if (value.status) {
        agg.match({status: value.status})
    }

    const agg2 = Item.aggregate()
    if (value.sort) agg2.sort(value.sort)
    if (value.skip) agg2.skip(value.skip)
    if (value.limit) agg2.limit(value.limit)

    value.populate.forEach(field => {
        agg2.lookup({
            from: 'users',
            localField: field,
            foreignField: '_id',
            as: field,
            pipeline: Item.aggregate()
                .project("name email image role")
                .pipeline()
        })
    })

    agg.facet({
        totalCount: [ { $count: "count" } ],
        results: agg2.pipeline()
    })
        .unwind('totalCount')
        .addFields({ totalCount: "$totalCount.count"})

    let items = (await agg.exec())[0]
    if (!items) {
        items = { totalCount: 0, results: [] }
    }

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ items }))
}

module.exports = {
    save,
    get,
    updateStatus,
    deleteItem,
    listItems
}

const {StatusCodes} = require("http-status-codes");
const {Item, Tag, Report} = require("../models");
const {Response} = require("../helpers");

/** @type {ExpressRequestHandler} */
const getDashboard = async (req, res) => {
    const approvedItemsCount = await Item.count({ status: 'Approved' }).exec()
    const pendingItemsCount = await Item.count({ status: 'Pending' }).exec()
    const tagsCount = await Tag.count().exec()
    const pendingReportsCount = await Report.count({ status: 'Pending' }).exec()

/*
    const items = await Item.aggregate()
        .match({
            status: 'Approved',
            createdAt: {$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}
        }).exec()
*/


    return res
        .status(StatusCodes.OK)
        .json(Response.success({ approvedItemsCount, pendingItemsCount, tagsCount, pendingReportsCount }))
}


module.exports = {
    getDashboard
}

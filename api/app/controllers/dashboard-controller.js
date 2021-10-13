const {StatusCodes} = require("http-status-codes");
const {Item, Tag, Report, Device} = require("../models");
const {Response} = require("../helpers");

/** @type {ExpressRequestHandler} */
const getDashboard = async (req, res) => {
    const approvedItemsCount = await Item.count({ status: 'Approved' }).exec()
    const pendingItemsCount = await Item.count({ status: 'Pending' }).exec()
    const tagsCount = await Tag.count().exec()
    const pendingReportsCount = await Report.count({ status: 'Pending' }).exec()

    const items = await Item.aggregate()
        .match({
            createdAt: {$gt: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}
        })
        .project({createdAt: {$dateToString:{format: "%Y-%m-%d", date: "$createdAt"}}, status: 1})
        .group({
            _id : { createdAt: '$createdAt', status: '$status' },
            count : {$sum : 1}
        })
        .addFields({ date: '$_id.createdAt', status: '$_id.status' })
        .project({_id: 0, count: 1, date: 1, status: 1})

    const installs = await Device.aggregate()
        .match({
            createdAt: {$gt: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}
        })
        .project({createdAt: {$dateToString:{format: "%Y-%m-%d", date: "$createdAt"}}})
        .group({
            _id : { createdAt: '$createdAt' },
            count : {$sum : 1}
        })
        .addFields({ date: '$_id.createdAt' })
        .project({_id: 0, count: 1, date: 1})

    const dates = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d
    })

    const items7Days = {Approved: [], Pending: [], Rejected: []}
    const installs7Days = []

    const a = items.filter(v => v.status === 'Approved')
    const p = items.filter(v => v.status === 'Pending')
    const r = items.filter(v => v.status === 'Rejected')

    dates.reverse().forEach(v => {
        const date = v.toISOString().split('T')[0]
        const ac = a.find(v => v.date === date)
        const pc = p.find(v => v.date === date)
        const rc = r.find(v => v.date === date)

        items7Days.Approved.push({ date, count: ac ? ac.count : 0})
        items7Days.Pending.push({ date, count: pc ? pc.count : 0})
        items7Days.Rejected.push({ date, count: rc ? rc.count : 0})

        const install = installs.find(v => v.date === date)
        installs7Days.push({ date, count: install ? install.count : 0 })
    })

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ approvedItemsCount, pendingItemsCount, tagsCount, pendingReportsCount, items7Days, installs7Days }))
}


module.exports = {
    getDashboard
}

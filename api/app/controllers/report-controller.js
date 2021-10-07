/** @type {ExpressRequestHandler} */
const {Report} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");


const listAll = async (req, res) => {
    const reports = await Report.find().exec()
    return res.json(Response.success({ reports }))
}

/** @type {ExpressRequestHandler} */
const updateStatus = async (req, res) => {
    const id = req.params.id
    const status = req.body.status

    if (!['Pending', 'Resolved', 'Rejected'].includes(status)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Invalid status"))
    }

    if (status !== 'Pending' && !req.body.actionTaken) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Action Taken is required"))
    }

    /** @type {Report} */
    const report = await Report.findById(id).exec();
    if (!report) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json(Response.error("Report not found"))
    }

    report.status = status
    report.statusChangedBy = req['userId']
    report.statusChangedAt = Date.now()

    if (status !== 'Pending') {
        report.actionTaken = req.body.actionTaken
    }

    await report.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ report }))
}

/** @type {ExpressRequestHandler} */
const updateNotes = async (req, res) => {
    const id = req.params.id
    const notes = req.body.notes

    if (!notes) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Notes is required"))
    }

    /** @type {Report} */
    const report = await Report.findById(id).exec();
    if (!report) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json(Response.error("Report not found"))
    }

    report.notes = notes
    await report.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success({ report }))
}


module.exports = {
    listAll,
    updateStatus,
    updateNotes
}

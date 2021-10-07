const {User} = require("../models");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");

/** @type {ExpressRequestHandler} */
const get = async (req, res) => {
    const id = req.params.id

    try {
        const user = await User.findById(id).exec()
        return res.json(Response.success({ user }))
    } catch (e) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json(Response.error("User not found"))
    }
}

/** @type {ExpressRequestHandler} */
const add = async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        return res.json(Response.success({ user }))
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }
}

/** @type {ExpressRequestHandler} */
const listAll = async (req, res) => {
    try {
        const users = await User.find().exec()
        return res.json(Response.success({ users }))
    } catch (e) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(Response.error("Database error"))
    }
}

/** @type {ExpressRequestHandler} */
const update = async (req, res) => {
    const id = req.params.id === "me" ? req['userId'] : req.params.id

    try {
        const user = await User.findById(id).exec()
        user.setAuthor( req['userId'])

        if (req.body['password']) {
            const isPasswordMatch = await user.comparePassword(req.body['authenticate'])
            if(!isPasswordMatch) {
                return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json(Response.error("Password Error"))
            }
        }

        Object.keys(req.body).forEach(v => {
            user[v] = req.body[v]
        })

        await user.save()
        return res.json(Response.success({ user }))
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }
}


module.exports = {
    get,
    add,
    listAll,
    update
}
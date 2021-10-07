const nodemailer = require("nodemailer");
const nunjucks = require("nunjucks");
const jwt = require('jsonwebtoken');
const inlineCss = require('inline-css');
const {StatusCodes} = require('http-status-codes');

const {User, Otp} = require('../models')
const {Response} = require("../helpers");

/** @type {ExpressRequestHandler} */
const login = async (req, res) => {
    const email = req.body['email']
    const password = req.body['password']

    if (!email || !password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email and password is required"))
    }

    const user = await User.findOne({ email }).exec()
    if (!user) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email or password invalid"))
    }

    let isCorrect = await user.comparePassword(password)
    if (!isCorrect) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email or password invalid"))
    }

    const expiresIn = process.env.JWT_EXPIRY;
    const token = jwt.sign({
        user: user
    }, process.env.JWT_SECRET, { expiresIn, subject: user.id, audience: process.env.API_URL });
    return res.json(Response.success({ token, expiresIn, user }))
}

/** @type {ExpressRequestHandler} */
const forgetPasswordVerifyEmail = async (req, res) => {
    const email = req.body['email']

    if (!email) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email is required"))
    }

    const user = await User.findOne({ email }).exec()
    if (!user) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email not registered"))
    }

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASSWORD,
        },
    });

    /** @type Otp otp */
    const otp = await Otp.generateOtp(email, "Password Reset")

    const otpUrl = process.env.API_URL + `/admin/auth/recover-password/verify?code=${otp.code}&email=${otp.email}`

    const html = nunjucks.render("emails/recover-account.njk", {
        otp: {
            code: otp.code,
            url: otp.url
        },
        info: {
            url: process.env.APP_URL
        }
    })

    await transporter.sendMail({
        from: `"Infopedia" <${process.env.MAILER_EMAIL}>`,
        to: email,
        subject: "Password reset",
        text: `Your password reset code is ${otp.code}.\r\nYou can also use the following url to reset password. ${otpUrl} \r\n`,
        html: await inlineCss(html, {url: process.env.API_URL}),
    });

    res.json({
        email: otp.email,
        expiresOn: otp.expiresOn
    })
}


/** @type {ExpressRequestHandler} */
const forgetPasswordVerifyOtp = async (req, res) => {
    const email = req.query['email']
    const code = parseInt(req.query['code'])

    if (!email) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email is required"))
    }

    if (!code) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Verification code required"))
    }

    try {
        await Otp.verifyOtp(email, "Password Reset", code)

        const user = await User.findOne({ email }).exec()
        if (!user) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Response.error("Email not registered"))
        }

        const audience = process.env.API_URL + "/admin/auth/password-recovery";
        const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: 60 * 15, subject: user.id, audience }); // 15 min

        if (req.accepts('json')) {
            return res.json(Response.success({ token, expiresIn: 60 * 15 }));
        } else {
            return res.render('404', { url: req.url });
        }
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e))
    }
}


/** @type {ExpressRequestHandler} */
const forgetPasswordChange = async (req, res) => {
    const password = req.body['password']
    const token = req.body['token']

    const audience = process.env.API_URL + "/admin/auth/password-recovery";
    let decoded = null;
    try {
        decoded = token && jwt.verify(token, process.env.JWT_SECRET, {audience})
    } catch (e) {
    }

    if (!decoded) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Invalid token"))
    }

    if (!password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Password required"))
    }

    /** @type User */
    const user = await User.findOne({ id: decoded.sub }).exec()
    if (!user) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("User not found"))
    }

    user.password = password;
    await user.save();

    return res.json(Response.success({ user }))
}

const getMe = async (req, res) => {
    const id = "613f062ae78aa72100094506"

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
const adminAuthMiddleware = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    if (!req.header('Authorization')) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(Response.error("Authorization token required"))
    }

    const token = req.header('Authorization').replace("Bearer ", "")
    let decoded = null;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, {audience: process.env.API_URL})
    } catch (e) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(Response.error("Invalid token"))
    }

    req.user = decoded
    req.userId = decoded.sub

    next()
}


module.exports = {
    login,
    forgetPasswordVerifyEmail,
    forgetPasswordVerifyOtp,
    forgetPasswordChange,
    getMe,
    adminAuthMiddleware
}

const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const { response } = require('../responses/response')
const crypto = require('crypto')
const { sendVerificationEmail, deviceChangedEmail } = require('../utils/verifyEmail')
const tokenModel = require('../models/token')
const { createUser, attachCookiesToResponse } = require('../utils/jwt utils')


const Register = async (req, res) => {

    const { email, phoneNumber, password, username } = req.body

    if (!email || !phoneNumber || !password || !username) {

        res.status(StatusCodes.CREATED).json(response({
            data: 'Please provide valid valid credentials',
            status: StatusCodes.BAD_REQUEST
        }))
    }


    const user = await User.findOne({ email })

    if (user) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'User email already exists',
            status: StatusCodes.BAD_REQUEST
        }))

    }

    const isFirstAccount = (await User.countDocuments({}) === 0)
    const role = isFirstAccount ? "admin" : "user"

    const verificationToken = crypto.randomBytes(35).toString('hex')

    const origin = 'http://localhost:8080'


    const newUser = {
        email,
        phoneNumber,
        password,
        username,
        role,
        validationString: verificationToken
    }


    const createUser = await User.create({ newUser })

    sendVerificationEmail({ name: username, origin, verificationToken, email })

    res.status(StatusCodes.CREATED).json(response({
        data: 'User have been registed successfully, an email have been sent to your inbox',
        status: StatusCodes.CREATED
    }))

}


const verifyEmail = async (req, res) => {
    const { email, verificationToken } = req.params

    if (!email || !verificationToken) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'Please provide valid crendentials',
            status: StatusCodes.BAD_REQUEST
        }))

    }

    const user = await User.findOne({ email })

    if (!user) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'user not found',
            status: StatusCodes.BAD_REQUEST
        }))
    }

    if (verificationToken != user.validationString) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'User not validated',
            status: StatusCodes.BAD_REQUEST
        }))

    }


    user.isVerified = true
    user.verified = Date.now
    user.validationString = ''

    await user.save()

    res.status(StatusCodes.CREATED).json(response({
        data: 'Your Email have been verified',
        status: StatusCodes.OK
    }))
}




const login = async (req, res) => {

    const { phoneNumber, password } = req.body

    if (!phoneNumber || !password) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'Please provide valid valid credentials',
            status: StatusCodes.BAD_REQUEST
        }))

    }

    const user = await User.findOne({ phoneNumber })


    if (!phoneNumber) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'Please provide valid valid credentials',
            status: StatusCodes.BAD_REQUEST
        }))
    }

    const confirmPassword = user.validatePassword(password)

    if (!confirmPassword) {
        res.status(StatusCodes.CREATED).json(response({
            data: 'Please provide valid valid credentials',
            status: StatusCodes.BAD_REQUEST
        }))
    }

    const userToken = createUser(user)


    const checkToken = await tokenModel.findOne({ user: user._id })

    let refreshToken = ''

    refreshToken = crypto.randomBytes(20).toString('hex')

    if (checkToken) {

        const { isValid } = checkToken

        if (!isValid) {
            res.status(StatusCodes.CREATED).json(response({
                data: 'You are not allowed to continue to the next due to failed account',
                status: StatusCodes.BAD_REQUEST
            }))

        }

        refreshToken = checkToken.refreshToken

        attachCookiesToResponse({ res, user: userToken, refreshToken })



        if (req.headers['user-agent'] !== checkToken.userAgent) {

            checkToken.userAgent = req.headers['user-agent'];

            await checkToken.save()

            deviceChangedEmail({ name: req.user.name, email: user.email })

            await tokenModel.findOneAndDelete({ user: user._id })

            refreshToken = crypto.randomBytes(20).toString('hex')

            attachCookiesToResponse({ res, user: userToken, refreshToken })



        } else if (req.cookies.refreshToken !== checkToken.refreshToken) {

            await tokenModel.findOneAndDelete({ user: user._id })

            refreshToken = crypto.randomBytes(20).toString('hex')

            attachCookiesToResponse({ res, user: userToken, refreshToken })
        }


        res.status(StatusCodes.CREATED).json(response({
            data: 'You have been verified',
            status: StatusCodes.OK
        }))

        return;

    }


    let ip = req.ip
    let userAgent = req.headers['user-agent'];



    const newUsers = {
        ip,
        userAgent,
        refreshToken,
        user: user._id
    }

    attachCookiesToResponse({ res, user: userToken, refreshToken })

    await tokenModel.create(newUsers)

}


const logout = async (req, res) => {

    await tokenModel.findOneAndDelete({ user: req.user.userId })

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(StatusCodes.CREATED).json(response({
        data: 'logged out',
        status: StatusCodes.OK
    }))

}





module.exports = {
    Register,
    verifyEmail,
    login,
    logout

}
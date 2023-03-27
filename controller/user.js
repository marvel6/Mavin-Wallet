const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const { response } = require('../responses/response')
const crypto = require('crypto')
const { sendVerificationEmail } = require('../utils/verifyEmail')
const tokenModel = require('../models/token')


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



}





const logout = async (req, res) => {

}
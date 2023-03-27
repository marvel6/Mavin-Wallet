const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const { response } = require('../responses/response')
const crypto = require('crypto')
const { sendVerificationEmail } = require('../utils/verifyEmail')


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

}





const logout = async (req, res) => {

}
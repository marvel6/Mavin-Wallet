const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const { response } = require('../responses/response')
const crypto = require('crypto')
const { sendVerificationEmail, deviceChangedEmail } = require('../utils/verifyEmail')
const tokenModel = require('../models/token')
const { createUser, attachCookiesToResponse } = require('../utils/Jutils')


const Register = async (req, res) => {

    try {
        const { email, phoneNumber, password, username, transactionPin } = req.body

        if (!email || !phoneNumber || !password || !username || !transactionPin) {

            throw new Error('Please provide valid crendentials')
        }


        const user = await User.findOne({ email })

        if (user) {
            throw new Error('User email already exists')
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
            validationString: verificationToken,
            transactionPin
        }


        const createUsers = await User.create(newUser)

        sendVerificationEmail({ name: username, origin, verificationToken, email })

        res.status(StatusCodes.CREATED).json(response({
            data: 'User have been registed successfully, an email have been sent to your inbox',
            status: StatusCodes.CREATED
        }))



    } catch (error) {

        console.log(error)
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `BAD_REQUEST ${error.message} `,
            status: StatusCodes.BAD_REQUEST
        }))

    }

}


const verifyEmail = async (req, res) => {
    try {
        const { email, verificationToken } = req.body

        if (!email || !verificationToken) {

            throw new Error('Please provide valid crendentials')
        }

        const user = await User.findOne({ email })

        if (!user) {
            throw new Error('user not found')
        }

        if (verificationToken != user.validationString) {
            throw new Error('User not validated')
        }


        user.isVerified = true
        user.verified = Date.now()
        user.validationString = ''

        await user.save()

        res.status(StatusCodes.OK).json(response({
            data: 'Your Email have been verified',
            status: StatusCodes.OK
        }))

    } catch (error) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `BAD_REQUEST ${error.message}`,
            status: StatusCodes.BAD_REQUEST
        }))

    }
}


const login = async (req, res) => {

    try {

        const { email, password } = req.body

        if (!email || !password) {

            throw new Error('please provide valid email or password');

        }

        const user = await User.findOne({ email })

        if (!user) {
            throw new Error('Invalid email or password');
        }


        const comparePassword = await user.comparePassword(password)


        if (!comparePassword) {
            throw new Error('Invalid email or password');
        }

        const userToken = createUser(user)


        const checkToken = await tokenModel.findOne({ user: user._id })

        let refreshToken = ''

        refreshToken = crypto.randomBytes(20).toString('hex')

        if (checkToken) {

            const { isValid } = checkToken

            if (!isValid) {
                throw new Error('Account has been locked');
            }

            refreshToken = checkToken.refreshToken

            attachCookiesToResponse({ res, user: userToken, refreshToken })

            if (req.headers['user-agent'] !== checkToken.userAgent) {

                checkToken.userAgent = req.headers['user-agent'];

                deviceChangedEmail({ name: req.user.name, email: user.email });

                await checkToken.save()

                await tokenModel.findOneAndDelete({ user: user._id })

                refreshToken = crypto.randomBytes(20).toString('hex')

                attachCookiesToResponse({ res, user: userToken, refreshToken })


            } else if (req.cookies.refreshToken !== checkToken.refreshToken) {

                await tokenModel.findOneAndDelete({ user: user._id })

                refreshToken = crypto.randomBytes(20).toString('hex')

                attachCookiesToResponse({ res, user: userToken, refreshToken })
            }

            return res.status(StatusCodes.OK).json(response({
                data: `${user.username} has been logged in successfully`,
                status: StatusCodes.OK
            }))


        };


        let ip = req.ip
        let userAgent = req.headers['user-agent'];



        const newUsers = {
            ip,
            userAgent,
            refreshToken,
            user: user._id,
        }

        attachCookiesToResponse({ res, user: userToken, refreshToken })

        await tokenModel.create(newUsers)

        res.status(StatusCodes.OK).json(response({
            data: `${user.username} has been logged in successfully`,
            status: StatusCodes.OK
        }))

    } catch (error) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `BAD_REQUEST ${error.message}`,
            status: StatusCodes.BAD_REQUEST
        }))

    }

}


const logout = async (req, res) => {

    try {
        await tokenModel.findOneAndDelete({ user: req.user.userId });

        res.cookie('accessToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now()),
        });
        res.cookie('refreshToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now()),
        });

        res.status(StatusCodes.OK).json({ msg: 'user logged out!' });

    } catch (error) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: ` BAD_REQUEST ${error.message}`,
            status: StatusCodes.BAD_REQUEST

        }))

    }

}





module.exports = {
    Register,
    verifyEmail,
    login,
    logout

}
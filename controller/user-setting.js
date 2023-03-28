const { response } = require('../responses/response')
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { createUser, attachCookiesToResponse } = require('../utils/Jutils')


const getallWalletUsers = async (req, res) => {
    const users = await User.find({ role: 'user' }).select('-password')

    res.status(StatusCodes.OK).json(response({
        data: users,
        status: StatusCodes.OK
    }))

}


const getSingleUserWallet = async (req, res) => {
    try {
        const { userId: _id } = req.params

        const users = await User.findOne({ _id })

        if (!users) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `There is no user with id ${users._id}`,
                status: StatusCodes.BAD_REQUEST
            }))
        }

        res.status(StatusCodes.OK).json(response({
            data: users,
            status: StatusCodes.OK
        }))

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response({
            data: `Something happend when getSingleUserWallet`,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }))


    }


}


const updateUserWalletInfo = async (req, res) => {
    try {
        const { email, username } = req.body

        if (!email || !username) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `Please provide email and password`,
                status: StatusCodes.BAD_REQUEST
            }))

        }

        const checkuser = await User.findOne({ _id: req.user.userId })

        if (!checkuser) {

            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `User not available`,
                status: StatusCodes.BAD_REQUEST
            }))
        }

        checkuser.username = username
        checkuser.email = email

        await checkuser.save();

        const userToken = createUser(checkuser)

        attachCookiesToResponse({ res, user: userToken })

        res.status(StatusCodes.OK).json(response({
            data: `User email ${checkuser.email} and username ${checkuser.username} have been updated successfully`,
            status: StatusCodes.OK
        }))

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response({
            data: `Something happend when updating user`,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }))

    }
}


const updateUserWalletPassword = async (req, res) => {

    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `Please provide valid credentials`,
                status: StatusCodes.BAD_REQUEST
            }))
        }

        const user = await User.findOne({ _id: req.user.userId })

        if (!user) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `User not found`,
                status: StatusCodes.BAD_REQUEST
            }))

        }

        const checkOldPassword = user.validatePassword(oldPassword)

        if (!checkOldPassword) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `Old password verification failed`,
                status: StatusCodes.BAD_REQUEST
            }))
        }

        user.password = newPassword

        await user.save()

        res.status(StatusCodes.OK).json(response({
            data: `You have updated your password successfully`,
            status: StatusCodes.OK
        }))

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response({
            data: `INTERNAL SERVER ERROR OCCURED`,
            status: StatusCodes.INTERNAL_SERVER_ERROR
        }))

    }


}


module.exports = {
    getallWalletUsers,
    getSingleUserWallet,
    updateUserWalletInfo,
    updateUserWalletPassword,
}



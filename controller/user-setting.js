const { response } = require('../responses/response')
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { createUser, attachCookiesToResponse } = require('../utils/Jutils')
const { checkPermission } = require('../utils/Jutils')


const getallWalletUsers = async (req, res) => {
    const users = await User.find({ role: 'admin' }).select('-password -validationString ')

    res.status(StatusCodes.OK).json(response({
        data: users,
        status: StatusCodes.OK
    }))

}


const getSingleUserWallet = async (req, res) => {
    try {
        const { id: userId } = req.params

        const users = await User.findOne({ userId }).select('-password -validationString ')

        if (!users) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `There is no user with id ${users._id}`,
                status: StatusCodes.BAD_REQUEST
            }))
        }

        checkPermission(req.user, users._id)

        res.status(StatusCodes.OK).json(response({
            data: users,
            status: StatusCodes.OK
        }))

    } catch (error) {

        console.log(error)
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happend when getSingleUserWallet`,
            status: StatusCodes.BAD_REQUEST
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
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happend when updating user`,
            status: StatusCodes.BAD_REQUEST
        }))

    }
}


const updateUserWalletPassword = async (req, res) => {

    try{
        const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Password mismatch`,
            status: StatusCodes.BAD_REQUEST
        }))
    }


    const user = await User.findOne({ user: req.user.userId })

    if (!user) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `There is no user with this account`,
            status: StatusCodes.BAD_REQUEST
        }))
    }

    const checkPasswordValid = await user.comparePassword(oldPassword)


    if (!checkPasswordValid) {
        
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Password Incorrect`,
            status: StatusCodes.BAD_REQUEST
        }))
    }

    user.password = newPassword

    user.save();

    res.status(StatusCodes.OK).json(response({
        data: `Your password have been updated successfully`,
        status: StatusCodes.OK
    }))

    }catch(error){
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happened while updating user info`,
            status: StatusCodes.BAD_REQUEST
        }))

    }

}


const deleteWalletAccount = async (req, res) => {

    try {
        const { id: userId } = req.params

        const user = await User.findOne({ userId })

        if (!user) {
            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: `There is no user with this account`,
                status: StatusCodes.BAD_REQUEST
            }))
        }

        const removeAccount = await User.findOneAndDelete({ userId })

        await removeAccount.remove();

        res.status(StatusCodes.OK).json(response({
            data: `Your account have been deleted`,
            status: StatusCodes.OK
        }))

    } catch (error) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happened while deleting user account`,
            status: StatusCodes.BAD_REQUEST
        }))

    }


}

module.exports = {
    getallWalletUsers,
    getSingleUserWallet,
    updateUserWalletInfo,
    updateUserWalletPassword,
    deleteWalletAccount
}



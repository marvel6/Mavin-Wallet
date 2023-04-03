const Transact = require('../models/transactions')
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { response } = require('../responses/response')
const crypto = require('crypto')
const { currentTime } = require('../utils/Jutils')
const CodePin = require('../models/getTransaction')
const { generateCodeUnique } = require('../utils/RandomCodes/codes')


const makeTransaction = async (req, res) => {

    try {
        const { receiver, amount, pin } = req.body

        if (!receiver || !amount || !pin) {
            throw new Error('please provide valid credentials')
        }

        const user = await User.findOne({ _id: req.user.userId })

        if (!user && !user.phoneNumber) {
            throw new Error('No user with this account')
        }

        if (amount > user.balance) {
            
            throw new Error('Insufficient balance account')

        } else if (amount < user.balance || amount == user.balance) {

            const checkpin = await user.comparePin(pin)

            if (!checkpin) {
                throw new Error('incorrect pin , please provide correct pin')
            }

            const checkReciever = await User.findOne({ phoneNumber: receiver })

            if (!checkReciever) {
                throw new Error('This user dosent have an account with Mavin')
            }

            const receiverIncrease = checkReciever.balance + Number(amount);
            const senderIncrease = user.balance - Number(amount)

            checkReciever.balance = receiverIncrease
            user.balance = senderIncrease

            await checkReciever.save();
            await user.save();



            let ref = crypto.randomBytes(16).toString('hex')

            const newTransact = {
                sender: user.phoneNumber,
                receiver,
                amount,
                referenceId: ref,
                date: currentTime().toString()
            }


            const transaction = await Transact.create(newTransact)


            res.status(StatusCodes.OK).json(response({
                data: transaction,
                status: StatusCodes.OK
            }))

            return;
        } else {

            throw new Error('Payment cannot be processed , please contact admin')
        }

    } catch (error) {

        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happened while making transactions with Error: ${error.message}`,
            status: StatusCodes.BAD_REQUEST

        }))

    }


}


const getUserSingleTransactions = async (req, res) => {

    try {
        const { number } = req.body

        if (!number) {
            throw new Error('please provide user number')
        }

        const users = await User.findOne({ phoneNumber: number })

        if (!users) {
            throw new Error('No user with this number')
        }

        const user = await Transact.find({ $or: [{ sender: number }, { receiver: number }] })

        const transaction = user.map(transact => {

            const status = (users.phoneNumber === transact.sender) ? "sent" : "recieved"

            return {
                sender: transact.sender,
                receiver: transact.receiver,
                amount: transact.amount,
                ref: transact.referenceId,
                date: transact.date,
                status
            }
        })

        res.status(StatusCodes.OK).json(response({
            data: transaction,
            status: StatusCodes.OK

        }))

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happened while getting user transactions with Error: ${error.message}`,
            status: StatusCodes.BAD_REQUEST

        }))

    }

}



const getTransactionCode = async (req, res) => {
    const { amount } = req.body

    try {
        if (!amount) {
            throw new Error('There is no amount for this transactions')
        }

        const user = await User.findOne({ _id: req.user.userId })

        if (!user) {
            throw new Error('This user is not registered')
        }

        const arrs = generateCodeUnique()

        const newUser = {
            name: user.username,
            amount,
            code: arrs,
            user: req.user.userId

        }

        const generatedCode = await CodePin.create(newUser)

        res.status(StatusCodes.OK).json(response({
            data: newUser,
            status: StatusCodes.OK
        }))

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happended while generating code with Error: ${error.message}`,
            status: StatusCodes.BAD_REQUEST
        }))

    }

}



const rechargeAccountBalance = async (req, res) => {

    try {
        const { code } = req.body

        req.body = req.user

        if (!code) {
            throw new Error('please provide code')
        }

        const codeCheck = await CodePin.findOne({ code: code })

        if (!codeCheck || codeCheck.status) {
            throw new Error("This code dose'nt exists or have been used")
        }


        const user = await User.findOne({ _id: req.user.userId })

        if (!user) {
            throw new Error('User not available')
        }


        user.balance += Number(codeCheck.amount)
        codeCheck.status = true

        await user.save()
        await codeCheck.save()


        res.status(StatusCodes.OK).json(response({
            data: `You have credited your account with ${codeCheck.amount}`,
            status: StatusCodes.OK
        }))

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: `Something happpened while crediting account with this Error:${error.message}`,
            status: StatusCodes.BAD_REQUEST
        }))

    }

}


module.exports = {
    makeTransaction,
    getTransactionCode,
    getUserSingleTransactions,
    rechargeAccountBalance
}
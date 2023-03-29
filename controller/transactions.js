const Transact = require('../models/transactions')
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { response } = require('../responses/response')
const crypto = require('crypto')
const { currentTime } = require('../utils/Jutils')

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

            res.status(StatusCodes.BAD_REQUEST).json(response({
                data: 'Insufficient balance account',
                status: StatusCodes.BAD_REQUEST
            }))
        } else if (amount < user.balance  || amount == user.balance) {

            const checkpin = await user.comparePin(pin)

            if (!checkpin) {
                throw new Error('incorrect pin , please provide correct pin')
            }

            const checkReciever = await User.findOne({ phoneNumber: receiver })

            if (!checkReciever) {
                throw new Error('This user dosent have an account with Mavin')
            }

            const receiverIncrease = checkReciever.balance +  Number(amount);
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

        console.log(error)
        res.status(StatusCodes.BAD_REQUEST).json(response({
            data: 'There was an error',
            status: StatusCodes.BAD_REQUEST
        }))

    }


}


module.exports = {
    makeTransaction
}
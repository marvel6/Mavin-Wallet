const mongoose = require('mongoose')
const product = require('../../My Folders/PRO/E-Commerce-API/models/product')


const Transactions = new mongoose.Schema({

    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },

    referenceId: {
        type: String,
        default: true
    },
    amount: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true

    }
})






module.exports = mongoose.model('Transaction', Transactions)
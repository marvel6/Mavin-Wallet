const mongoose = require('mongoose')


const allTransactPin = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    amount: {
        type: String,
        required: true
    },

    code: {
        type: String,
        required: true,

    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true

    },
    status: {
        type: Boolean,
        default: false
    }
})



module.exports = mongoose.model('GenerateCode', allTransactPin)
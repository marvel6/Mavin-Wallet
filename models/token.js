const mongoose = require('mongoose')

const tokenModel = new mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    isValid: {
        type: String,
        default: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });


module.exports = mongoose.model('tokenUser', tokenModel)
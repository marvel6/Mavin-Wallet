const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'please provide username'],
        min: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'please provide email'],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'please provide a valid email'
        }
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'please provide phone number'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    balance: {
        type: Number,
        default: 0
    },
    validationString: String,

    transactionPin: {
        type: String,
        required: true,
    },

    isVerified: {
        type: Boolean,
        default: false
    },
    verified: Date
})


userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})


userSchema.methods.comparePassword = async function (password) {
    const valid = await bcrypt.compare(password, this.password)
    return valid;
}


userSchema.pre('save', async function () {
    if (!this.isModified('transactionPin')) return;

    const salt = await bcrypt.genSalt(10)
    this.transactionPin = await bcrypt.hash(this.transactionPin, salt)
})

userSchema.methods.comparePin = async function (pin) {
    const valid = await bcrypt.compare(pin, this.transactionPin)
    return valid;
}








module.exports = mongoose.model('user', userSchema)
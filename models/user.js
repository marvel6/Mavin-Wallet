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
        unique: true,
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


userSchema.methods.validatePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}



module.exports = mongoose.model('user', userSchema)
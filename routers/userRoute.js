const express = require('express')
const router = express.Router()


const {Register,login,logout,verifyEmail} = require('../controller/user')

const {authenticateUser} = require('../middleware/authorization')



router.route('/register').post(Register)
router.route('/login').post(login)
router.route('/logout').delete(authenticateUser,logout)

router.route('/user/verify-email').post(verifyEmail)






module.exports = router
const express = require('express')
const router = express()

const {
    getallWalletUsers,
    getSingleUserWallet,
    updateUserWalletInfo,
    updateUserWalletPassword,
} = require('../controller/user-setting')


const { authenticateUser, checkPermision } = require('../middleware/authorization')

router.route('/').get(authenticateUser, checkPermision("admin"), getallWalletUsers)

router.route('/:id').get(authenticateUser, getSingleUserWallet)

router.route('/updateuser').post(authenticateUser, updateUserWalletInfo)

router.route('/updatepassword').post(authenticateUser, updateUserWalletPassword)


module.exports = router
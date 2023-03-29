const express = require('express')
const router = express()

const {
    getallWalletUsers,
    getSingleUserWallet,
    updateUserWalletInfo,
    updateUserWalletPassword,
    deleteWalletAccount
} = require('../controller/user-setting')


const { authenticateUser, checkPermision } = require('../middleware/authorization')

router.route('/all').get(authenticateUser,checkPermision("admin"), getallWalletUsers)

router.route('/:id').get(authenticateUser, getSingleUserWallet)

router.route('/updateuser').post(authenticateUser, updateUserWalletInfo)

router.route('/updatepassword').patch(authenticateUser, updateUserWalletPassword)

router.route('/deleteWallet/:id').delete(authenticateUser, deleteWalletAccount)


module.exports = router
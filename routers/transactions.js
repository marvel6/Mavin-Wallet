const express = require('express')
const router = express.Router()

const { makeTransaction, getUserSingleTransactions, getTransactionCode, rechargeAccountBalance, rechargeMyAccount } = require('../controller/transactions')
const { authenticateUser, checkPermision } = require('../middleware/authorization')


router.route('/transfers').post(authenticateUser, makeTransaction)

router.route('/Transactions').get(authenticateUser, getUserSingleTransactions)

router.route('/generateCode').post(authenticateUser, getTransactionCode)

router.route('/rechargeAccount').post(authenticateUser, rechargeAccountBalance)


router.route('/creditPersonalAccount').post(authenticateUser, rechargeMyAccount)



module.exports = router
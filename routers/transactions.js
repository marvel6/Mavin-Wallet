const express = require('express')
const router = express()

const { makeTransaction, getUserSingleTransactions, getTransactionCode } = require('../controller/transactions')
const { authenticateUser, checkPermision } = require('../middleware/authorization')


router.route('/transfers').post(authenticateUser, makeTransaction)

router.route('/Transactions').get(authenticateUser, getUserSingleTransactions)

router.route('/generateCode').post(authenticateUser, getTransactionCode)




module.exports = router
const express = require('express')
const router = express()

const { makeTransaction, getUserSingleTransactions } = require('../controller/transactions')
const { authenticateUser, checkPermision } = require('../middleware/authorization')


router.route('/transfers').post(authenticateUser, makeTransaction)

router.route('/Transactions').get(authenticateUser, getUserSingleTransactions)




module.exports = router
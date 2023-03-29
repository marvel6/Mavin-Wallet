const express = require('express')
const router = express()

const { makeTransaction } = require('../controller/transactions')
const { authenticateUser, checkPermision } = require('../middleware/authorization')


router.route('/transfers').post(authenticateUser, makeTransaction)




module.exports = router
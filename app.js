require('dotenv').config()
require('express-async-error')

const express = require('express')
const app = express()

const port = process.env.PORT || 8080

const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimiter = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
 

const connecdb = require('./db/connect')
const userRoute = require('./routers/userRoute')
const userSettingRoute = require('./routers/user-setting')
const makeTransactionRoute = require('./routers/transactions')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cookieParser(process.env.JWT_SECRET))



app.set('trust proxy', 1)

app.use(rateLimiter({
    windowMs: 1000 * 60 * 15,
    max: 60
}))


app.use(cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
}))

app.use(xss())
app.use(morgan('dev'))
app.use(helmet())
app.use(mongoSanitize())


app.use('/api/v1', userRoute)
app.use('/api/v1', userSettingRoute)
app.use('/api/v1/user', makeTransactionRoute)

const start = async () => {
    try {

        await connecdb('mongodb://0.0.0.0:27017/Mavin')

    } catch (error) {
        console.log(error.message)
    }
}


start().then(() => {
    app.listen(port, () => console.log(`app is listening on port ${port}`))
})
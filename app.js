require('dotenv').config()
require('express-async-error')

const express = require('express')
const app = express()

const port = process.env.PORT || 8080

const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')



const connecdb = require('./db/connect')
const userRoute = require('./routers/userRoute')
const userSettingRoute = require('./routers/user-setting')
const makeTransactionRoute = require('./routers/transactions')

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use(cookieParser(process.env.JWT_SECRET))



app.use(cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
}))

app.use(morgan('dev'))
app.use(helmet())


app.use('/api/v1',userRoute)
app.use('/api/v1',userSettingRoute)
app.use('/api/v1/user',makeTransactionRoute)

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
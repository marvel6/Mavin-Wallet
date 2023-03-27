require('dotenv').config()
require('express-async-error')

const express = require('express')
const app = express()

const port = process.env.PORT || 8080

const cookie = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')



const connecdb = require('./db/connect')
const userRoute = require('./routers/userRoute')



app.use(cookie(process.env.JWT_SECRET))


app.use(cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
}))

app.use(morgan('dev'))
app.use(helmet())


app.use('/api/v1',userRoute)


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
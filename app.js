require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const port = process.env.PORT || 8080

const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimiter = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')

const SwaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const YamlDoc = YAML.load('./swagger.yaml')



const connectDB = require('./db/connect')
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

if (process.env.NODE_ENV === 'development') {

    app.use(morgan('dev'))

}

app.use(helmet())
app.use(mongoSanitize())

app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(YamlDoc))

app.get('/', (req, res) => {

    let link =`<div style="display:flex; justify-content: center; align-items: center; width: 100%; heigth: 100vh;">
        <div style="border-radius: 5px; box-shadow: 2px 2px 5px #999; background-color: #FFF; padding: 20px; 
            margin-top:40px; min-width:500px; font-size:36px; display:flex; justify-content:center; align-items:center; flex-direction:column; >
            <h1 style="color: #5F9EA0; text-shadow: 1px 1px 1px #999; text-align: center;">Mavin Wallet</h1>
            <div style="margin: 20px 10px">
                <a href="/api-docs" 
                style="display: block; padding: 10px; background-color: #D8BFD8; 
                color: #FFF; text-decoration: none; box-shadow: 2px 2px 5px #999;">LINK TO API DOCS</a>
            </div>
        </div>
    </div>`

    res.send(link)
})



app.use('/api/v1', userRoute)
app.use('/api/v1', userSettingRoute)
app.use('/api/v1/user', makeTransactionRoute)


const start = async () => {
    try {

        await connectDB(process.env.MONGO_URI)

    } catch (error) {
        console.log(error.message)
    }
}

// 'mongodb://0.0.0.0:27017/Mavin'


start().then(() => {
    app.listen(port, () => console.log(`app is listening on port ${port}`))
})
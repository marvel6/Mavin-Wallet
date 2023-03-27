require('dotenv').config()
require('express-async-error')

const express = require('express')
const app = express()

const port = process.env.PORT || 8080



const connecdb = require('./db/connect')





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
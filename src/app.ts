var express = require('express')
const path = require('path')
var mongoose = require('mongoose')
var { checkUser } = require('./middleware/authmiddleware')
var cookies = require('cookie-parser')
var fs = require('fs')
var Img = require("./models/Image")
require('dotenv').config()


// all needed routers
const authRouter = require("./routes/authRouter")
const usersRouter = require("./routes/usersRouter")
const consultationsRouter = require('./routes/consultationRouter')


const app = express()

// allows viewing static files stored in "public" folder
app.use(express.static('public'))

// sets ejs as a view engine
app.set("view engine", "ejs")

// allows using JSON format
app.use(express.json())

// allows handling cookies via 'cookie-parser' module
app.use(cookies())

// middleware function "checkUser" checks whether someone is logged in
app.use("*", checkUser)

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/consultations', consultationsRouter)


mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result:any) => {
    app.listen(process.env.PORT, () => {
        console.log(`Listening on port: ${process.env.PORT}`)
    })
})
.catch((err:any) => console.log(err));


module.exports = app;

var express = require('express')
var mongoose = require('mongoose')
var { checkUser } = require('./middleware/authmiddleware')
var cookies = require('cookie-parser')
var cors = require('cors')
var Img = require("./models/Image")
require('dotenv').config()


// all needed routers
const authRouter = require("./routes/authRouter")
const usersRouter = require("./routes/usersRouter")
const consultationsRouter = require('./routes/consultationRouter')
const reservationsRouter = require('./routes/reservationRouter')


const app = express()

app.use(express.json())

app.use(cookies())

app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}))

app.use("*", checkUser)

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/consultations', consultationsRouter)
app.use('/reservations', reservationsRouter)


mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result:any) => {
    app.listen(process.env.PORT, () => {
        console.log(`Listening on port: ${process.env.PORT}`)
    })
})
.catch((err:any) => console.log(err));


module.exports = app;

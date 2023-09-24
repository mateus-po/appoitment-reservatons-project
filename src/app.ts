var express = require('express')
const path = require('path')
var mongoose = require('mongoose')
var { checkUser } = require('./middleware/authmiddleware')
var cookies = require('cookie-parser')
var fs = require('fs')
var {tpmFolder, tmpFilesMaxAge, absolutePath, port, dbURI} = require("./globalVariables")
var Img = require("./models/Image")


// all needed routers
const authRouter = require("./routes/authRouter")
const articlesRouter = require("./routes/articlesRouter")
const usersRouter = require("./routes/usersRouter")


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
app.use('/users', usersRouter)
app.use('/', articlesRouter);

async function garbage_collector_images() {
    for await (const img of Img.find({hasArticle: false})) {
        try {
            // if an image is older than 24 hours 
            if (Date.now() - img.uploadTime > 1000 * 60 * 60 * 24) {
                fs.unlinkSync(absolutePath + "/public" + img.path)
                await Img.findOneAndDelete({path: img.path})
            }
          } catch (err:any) {
            console.log(err.message)
          }
    }
}


mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result:any) => {
    app.listen(port, () => {
        console.log(`Listening on port: ${port}`)
        
        // deletes unwanted images every hour
        setInterval(garbage_collector_images, 1000 * 60 * 60)
    })
})
.catch((err:any) => console.log(err));


module.exports = app;

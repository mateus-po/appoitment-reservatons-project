var express = require('express')
const path = require('path')
const mongoose = require('mongoose')

// specifies port at which the app will be running
const port:number = 3000

// given URI allows connecting to a mongoDB database
const dbURI:string = ""



const articlesRouter = require("./routes/articlesRouter")


const app = express()

// allows viewing static files stored in "public" folder
app.use(express.static('public'))

app.set("view engine", "ejs")


app.use('/', articlesRouter);



mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result:any) => {
    app.listen(port, () => console.log(`Listening on port: ${port}`))
})
.catch((err:any) => console.log(err));


module.exports = app;

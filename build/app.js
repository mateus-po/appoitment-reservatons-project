"use strict";
var express = require('express');
const path = require('path');
var mongoose = require('mongoose');
var { checkUser } = require('./middleware/authmiddleware');
var cookies = require('cookie-parser');
var fs = require('fs');
var { tpmFolder, tmpFilesMaxAge } = require("./globalVariables");
// specifies port at which the app will be running
const port = 3000;
// given URI allows connecting to a mongoDB database
const dbURI = "mongodb+srv://mateus-po:1234@cluster0.4hb7ewh.mongodb.net/gatopedia";
// all needed routers
const authRouter = require("./routes/authRouter");
const articlesRouter = require("./routes/articlesRouter");
const usersRouter = require("./routes/usersRouter");
const app = express();
// allows viewing static files stored in "public" folder
app.use(express.static('public'));
// sets ejs as a view engine
app.set("view engine", "ejs");
// allows using JSON format
app.use(express.json());
// allows handling cookies via 'cookie-parser' module
app.use(cookies());
// middleware function "checkUser" checks whether someone is logged in
app.use("*", checkUser);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/', articlesRouter);
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
    app.listen(port, () => console.log(`Listening on port: ${port}`));
})
    .catch((err) => console.log(err));
// garbage collector of sorts
// deletes all photos in tmp folder that are older than tmpFilesMaxAge specifies
const deleteOldTmpPhotos = () => {
    const now = new Date();
    fs.readdir(tpmFolder, (err, files) => {
        if (err)
            console.log(err);
        files.forEach((file) => {
            let { birthtimeMs } = fs.statSync(tpmFolder + "/" + file);
            if (birthtimeMs + tmpFilesMaxAge < now.getTime()) {
                fs.unlink(tpmFolder + "/" + file, (err) => { if (err)
                    console.log(err); });
            }
        });
    });
};
setInterval(deleteOldTmpPhotos, 60 * 60 * 1000);
module.exports = app;

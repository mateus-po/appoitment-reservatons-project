"use strict";
var express = require('express');
const path = require('path');
var mongoose = require('mongoose');
var { checkUser } = require('./middleware/authmiddleware');
var cookies = require('cookie-parser');
// specifies port at which the app will be running
const port = 3000;
// given URI allows connecting to a mongoDB database
const dbURI = "";
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
module.exports = app;

"use strict";
var express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// specifies port at which the app will be running
const port = 3000;
// given URI allows connecting to a mongoDB database
const dbURI = "mongodb+srv://mateus-po:1234@cluster0.4hb7ewh.mongodb.net/?retryWrites=true&w=majority";
const authRouter = require("./routes/authRouter");
const articlesRouter = require("./routes/articlesRouter");
const app = express();
// allows viewing static files stored in "public" folder
app.use(express.static('public'));
app.set("view engine", "ejs");
app.use('/auth', authRouter);
app.use('/', articlesRouter);
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
    app.listen(port, () => console.log(`Listening on port: ${port}`));
})
    .catch((err) => console.log(err));
module.exports = app;

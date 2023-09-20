"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var express = require('express');
const path = require('path');
var mongoose = require('mongoose');
var { checkUser } = require('./middleware/authmiddleware');
var cookies = require('cookie-parser');
var fs = require('fs');
var { tpmFolder, tmpFilesMaxAge, absolutePath, port, dbURI } = require("./globalVariables");
var Img = require("./models/Image");
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
function garbage_collector_images() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (var _b = __asyncValues(Img.find({ hasArticle: false })), _c; _c = yield _b.next(), !_c.done;) {
                const img = _c.value;
                try {
                    // if an image is older than 24 hours 
                    if (Date.now() - img.uploadTime > 1000 * 60 * 60 * 24) {
                        fs.unlinkSync(absolutePath + "/public" + img.path);
                        yield Img.findOneAndDelete({ path: img.path });
                    }
                }
                catch (err) {
                    console.log(err.message);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
    app.listen(port, () => {
        console.log(`Listening on port: ${port}`);
        // deletes unwanted images every hour
        setInterval(garbage_collector_images, 1000 * 60 * 60);
    });
})
    .catch((err) => console.log(err));
module.exports = app;

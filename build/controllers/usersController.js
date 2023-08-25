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
var mongoose = require('mongoose');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var fs = require('fs');
var { secretString, saltrounds, absolutePath } = require('../globalVariables');
var { isStrongPassword, isEmail } = require('validator');
// displays a user page view with appropriate user data
module.exports.userPage_get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ 'nickname': req.params.username });
    if (user === null)
        res.status(404).redirect('/error404');
    res.render('user/userPage', { user });
});
// displays an user edit page
module.exports.userEdit_get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('user/userEdit');
});
module.exports.userEdit_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jwt;
    const newEmail = req.body.email;
    const newNickname = req.body.nickname;
    const newDescription = req.body.description;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    // checkng if the user is logged in with a correct JWT 
    if (token) {
        jwt.verify(token, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (!err) {
                // if newEmail is not undefined - it means email is to be edited
                if (newEmail) {
                    try {
                        const user = yield User.findById(decodedToken.id);
                        // checking if the given email is valid and different from previous email
                        if (newEmail == user.email) {
                            res.status(400).send({ error: 'Given e-mail is the same as the previous e-mail' });
                            return;
                        }
                        if (!isEmail(newEmail)) {
                            res.status(400).send({ error: `${newEmail} is not a correct e-mail` });
                            return;
                        }
                        // updating users email
                        yield User.findOneAndUpdate({ _id: decodedToken.id, }, { email: newEmail });
                        res.status(201).send("success");
                    }
                    catch (err) {
                        // if error has code 11000 it means that there already is an user with the new email
                        if (err.code == 11000) {
                            res.status(400).send({ error: "There already exists an user with that email" });
                            return;
                        }
                        res.status(400).send({ error: err.message });
                    }
                }
                // simillarly, if newNickname is not undefined - it means nickname is to be edited
                else if (newNickname) {
                    try {
                        const user = yield User.findById(decodedToken.id);
                        // checking if the given nickname is valid and different from previous nickname
                        if (newNickname == user.nickname) {
                            res.status(400).send({ error: 'Given nickname is the same as the previous nickname' });
                            return;
                        }
                        if (!/^[a-zA-Z0-9_-]*$/.test(newNickname)) {
                            res.status(400).send({ error: "Nickname consists of forbidden characters" });
                            return;
                        }
                        // updating users nickname
                        yield User.findOneAndUpdate({ _id: decodedToken.id, }, { nickname: newNickname });
                        res.status(201).send("success");
                    }
                    catch (err) {
                        // if error has code 11000 it means that there already is an user with the new nickname
                        if (err.code == 11000) {
                            res.status(400).send({ error: "There already exists an user with that nickname" });
                            return;
                        }
                        res.status(400).send({ error: err.message });
                    }
                }
                else if (newDescription) {
                    try {
                        const user = yield User.findById(decodedToken.id);
                        // checking if the given nickname is valid and different from previous nickname
                        if (newDescription == user.description) {
                            res.status(400).send({ error: 'Given description is the same as the previous description' });
                            return;
                        }
                        // updating users description
                        yield User.findOneAndUpdate({ _id: decodedToken.id, }, { description: newDescription });
                        res.status(201).send("success");
                    }
                    catch (err) {
                        res.status(400).send({ error: err.message });
                    }
                }
                else if (newPassword && oldPassword) {
                    try {
                        const user = yield User.findById(decodedToken.id);
                        // checking if the oldPassword matches the password stored in database 
                        if (!(yield bcrypt.compare(oldPassword, user.password))) {
                            res.status(400).send({ error: 'Given current password is incorrect' });
                            return;
                        }
                        // checking if the new password meets safe password requirements
                        if (!isStrongPassword(newPassword, {
                            minLength: 8,
                            minLowercase: 1,
                            minUppercase: 1,
                            minNumbers: 1,
                            minSymbols: 1,
                        })) {
                            res.status(400).send({ error: "Given password is not strong" });
                            return;
                        }
                        // updating users password
                        let hashed_password = yield bcrypt.hash(newPassword, saltrounds);
                        yield User.findOneAndUpdate({ _id: decodedToken.id, }, { password: hashed_password });
                        res.status(201).send("success");
                    }
                    catch (err) {
                        res.status(400).send({ error: err.message });
                    }
                }
                else {
                    res.status(400).send({ error: "Invalid request" });
                }
            }
            else {
                // if any JWT error occurs, the page redirects user to the login page
                res.redirect('/auth/login');
            }
        }));
    }
    else {
        // if user has no JWT token, the page redirects user to the login page
        res.redirect('/auth/login');
    }
});
module.exports.userEditAvatar_post = (req, res) => {
    const token = req.cookies.jwt;
    // checkng if the user is logged in with a correct JWT 
    if (token) {
        jwt.verify(token, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (!err) {
                try {
                    const user = yield User.findById(decodedToken.id);
                    if (user.avatarPath) {
                        fs.unlinkSync(absolutePath + "/public" + user.avatarPath);
                    }
                    yield User.findOneAndUpdate({ _id: decodedToken.id, }, { avatarPath: `/img/userAvatars/${req.file.filename}` });
                    res.status(201).send("success");
                }
                catch (err) {
                    console.log(err);
                    res.status(424).json({ error: "there was a problem uploading the new avatar" });
                }
            }
            else {
                res.redirect('/auth/login');
            }
        }));
    }
    else {
        // if user has no JWT token, the page redirects user to the login page
        res.redirect('/auth/login');
    }
};

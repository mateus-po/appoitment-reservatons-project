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
var { isStrongPassword, isEmail } = require('validator');
var bcrypt = require('bcrypt');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var { secretString, maxTokenAge, saltrounds, hostEmailAddress, hostEmailPassword } = require("../globalVariables");
// function that creates a token for newly singned up or logged in users
function createToken(id) {
    return jwt.sign({ id }, secretString, {
        expiresIn: maxTokenAge
    });
}
// logs in into the email service
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: hostEmailAddress,
        pass: hostEmailPassword
    }
});
// signup_get just renders the signup page
module.exports.signup_get = (req, res) => {
    // if there is a logged user, they shouldn't be able to see this site
    if (res.locals.loggedUser) {
        res.redirect('/');
    }
    res.render('auth/signup');
};
// signup_post manages data that are send by POST method
// if data is valid creates a user and saves it to the database
// additionally is responsible for hashing the password
module.exports.signup_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // deletes all the users
    // User.collection.deleteMany({})
    const email = req.body.email;
    const nickname = req.body.nickname;
    const password = req.body.password;
    // if either email or password are undefined, it means that an incorrect POST request was send
    if (email === undefined
        || password === undefined
        || nickname === undefined) {
        res.status(422).json({ error: "Invalid POST request" });
        return;
    }
    // checking if the given password meets safe password requirements
    if (!isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        res.status(422).json({ error: "Given password is not strong" });
        return;
    }
    // chcecking if the given email is valid
    if (!isEmail(email)) {
        res.status(422).json({ error: "Given e-mail is not valid" });
        return;
    }
    // checking if the given nickname consists only of letters, digits and 
    // "-" and "_" symbols
    if (!/^[0-9a-zA-Z_-]*$/.test(nickname)) {
        res.status(422).json({ error: "Given nickname contains forbidden characters" });
        return;
    }
    // checking it there already is an user with given email or nickname
    const user_same_email = yield User.findOne({ email });
    const user_same_nickname = yield User.findOne({ nickname });
    if (user_same_email) {
        res.status(422).json({ error: "There already exist an user with given e-mail" });
        return;
    }
    if (user_same_nickname) {
        res.status(422).json({ error: "There already exist an user with given nickname" });
        return;
    }
    // trying to create user in the database - if any error occurres, it 
    // means that the passed data is invalid
    // creating a token, that encodes all the user data
    const token = jwt.sign({ email, nickname, password }, secretString, { expiresIn: '10m' });
    // sending and email with given token, so that user can validate email account
    const mailConfigurations = {
        from: hostEmailAddress,
        to: email,
        subject: 'Validate your email address',
        // This would be the text of email body
        text: `Hello ${nickname}!\nThere is only one step left to complete your Gatopedia registration. You only need to veryfy your email address. You can do it by simply clicking this link: http://localhost:3000/auth/verify/${token}`
    };
    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) {
            console.log(error.message);
            res.status(500).json({ error: "Internal server error" });
        }
        else {
            res.status(201).send('success?');
        }
    });
});
// login_get just renders the login page
module.exports.login_get = (req, res) => {
    // if there is a logged user, they shouldn't be able to see this site
    if (res.locals.loggedUser) {
        res.redirect('/');
    }
    res.render('auth/login');
};
// manages login attempts
// creates a JWT iF logging if succedes
module.exports.login_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = yield User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httponly: true, maxAge: maxTokenAge * 1000 });
        res.status(201).json({ user: user.nickname });
    }
    catch (err) {
        res.status(400).send({ error: "Incorrect e-mail or password" });
    }
});
// logging out the user
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};
// renders page that says that email must be verified
module.exports.verify_get = (req, res) => {
    res.render('auth/verify');
};
// verifies given token and creates account if everything is valid
module.exports.verifyToken_get = (req, res) => {
    const verifyToken = req.params.verifyToken;
    if (verifyToken) {
        jwt.verify(verifyToken, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log(err.message);
                res.status(500).redirect('/error500');
                return;
            }
            try {
                // hashing the password
                decodedToken.password = yield bcrypt.hash(decodedToken.password, saltrounds);
                const user = yield User.create(decodedToken);
                res.status(201).redirect(`/auth/successful-verification`);
            }
            catch (err) {
                console.log(err.message);
                res.status(500).redirect('/error500');
                return;
            }
        }));
    }
};
module.exports.successfulVerification_get = (req, res) => {
    res.render('auth/successfulEmailVerification');
};
module.exports.forgotPassword_get = (req, res) => {
    // if there is a logged user, they shouldn't be able to see this site
    if (res.locals.loggedUser) {
        res.redirect('/');
    }
    res.render('auth/forgotPassword');
};
module.exports.forgotPassword_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if there is a logged user, they shouldn't be able to see this site
    if (res.locals.loggedUser) {
        return;
    }
    try {
        const email = req.body.email;
        if (!email || !isEmail(email)) {
            res.status(400).json({ error: 'Given email is invalid' });
            return;
        }
        const user = yield User.findOne({ email });
        if (!user) {
            res.status(400).json({ error: 'There is no user with given email' });
            return;
        }
        const token = jwt.sign({ id: user._id }, secretString, { expiresIn: '10m' });
        // sending and email with given token, so that user can validate email account
        const mailConfigurations = {
            from: hostEmailAddress,
            to: email,
            subject: 'Reset your password',
            // This would be the text of email body
            text: `Hello ${user.nickname}!\n There has been a request to change a password tied to your Gatopedia account.\nYou can change your password by following this link: http://localhost:3000/auth/forgot-password/${token}\nIf it wasn't you who made this request, just ignore this message\nHave a great day!\nGatopedia`
        };
        transporter.sendMail(mailConfigurations, function (error, info) {
            if (error) {
                console.log(error.message);
                res.status(500).json({ error: "Internal server error" });
            }
            else {
                res.status(201).send('success?');
            }
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
module.exports.forgotPasswordWithToken_get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyToken = req.params.verifyToken;
    if (verifyToken) {
        jwt.verify(verifyToken, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log(err.message);
                res.status(500).redirect('/error500');
                return;
            }
            try {
                const user = yield User.findById(decodedToken.id);
                if (!user) {
                    res.status(500).redirect('/error500');
                    return;
                }
                res.status(200).render('auth/forgotPasswordWithToken', { user });
            }
            catch (err) {
                console.log(err.message);
                res.status(500).redirect('/error500');
                return;
            }
        }));
    }
});
module.exports.forgotPasswordWithToken_post = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyToken = req.params.verifyToken;
    if (verifyToken) {
        jwt.verify(verifyToken, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log(err.message);
                res.status(500).redirect('/error500');
                return;
            }
            try {
                const user = yield User.findById(decodedToken.id);
                if (!user) {
                    res.status(500).redirect('/error500');
                    return;
                }
                const new_password = req.body.password;
                // if password doens't meet safe password requirements
                if (!isStrongPassword(new_password, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                })
                    || new_password.length > 50) {
                    res.status(422).json({ error: "Given password is not strong" });
                    return;
                }
                user.password = yield bcrypt.hash(new_password, saltrounds);
                user.save();
                res.status(201).send('success');
            }
            catch (err) {
                console.log(err.message);
                res.status(500).redirect('/error500');
                return;
            }
        }));
    }
});

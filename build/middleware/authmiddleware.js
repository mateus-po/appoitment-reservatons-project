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
var jwt = require('jsonwebtoken');
var User = require('../models/User');
var { secretString, maxTokenAge } = require('../globalVariables');
// used to protect some views from being accessed by an unauhtorised users
module.exports.requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.redirect('/auth/login');
                return;
            }
            else {
                try {
                    const user = yield User.findById({ _id: decodedToken.id });
                    if (!user) {
                        res.redirect('/auth/login');
                        return;
                    }
                }
                catch (err) {
                    console.log(err);
                    res.redirect('/auth/login');
                    return;
                }
                next();
            }
        }));
    }
    else {
        res.redirect('/auth/login');
    }
});
// chcecks the currently logged user and sends their data to the view
module.exports.checkUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jwt;
    if (token) {
        // refresh cookies' expiry time
        res.cookie('jwt', token, { httponly: true, maxAge: maxTokenAge * 1000, overwrite: true, secure: false });
        jwt.verify(token, secretString, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.locals.loggedUser = null;
                next();
            }
            else {
                let user = yield User.findById(decodedToken.id);
                res.locals.loggedUser = user;
                next();
            }
        }));
    }
    else {
        res.locals.loggedUser = null;
        next();
    }
});

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
var mongoose = require("mongoose");
var { isEmail, isAlphanumeric } = require("validator");
var bcrypt = require('bcrypt');
const UserModel = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "E-mail address is required"],
        unique: [true, "There already exists an user with given e-mail"],
        lowercase: true,
        validate: [isEmail, "Given e-mail is invalid"],
        index: true
    },
    nickname: {
        type: String,
        required: [true, "Nickname is required"],
        unique: true,
        validate: [(val) => { return /^[0-9a-zA-Z_-]*$/.test(val); }, "Given nickname is invalid"],
        index: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        maxLength: 300
    },
    avatarPath: {
        type: String,
        required: false
    }
});
// static method 
// it tries to find a user with matching email and password in the database
UserModel.statics.login = function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User.findOne({ email: email }, "_id email nickname password");
        // if there is no user with given email
        if (user === null) {
            throw Error('incorrect e-mail');
        }
        // if the password doesn't match the hashed password stored in database
        if (!(yield bcrypt.compare(password, user.password))) {
            throw Error('incorrect password');
        }
        return user;
    });
};
var User = mongoose.model('user', UserModel);
module.exports = User;

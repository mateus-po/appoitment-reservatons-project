var { isStrongPassword, isEmail } = require('validator')
var bcrypt = require('bcrypt')
var User = require('../models/User')
var jwt = require('jsonwebtoken')
import { Request, Response } from "express";
require('dotenv').config()

function createToken(id:string) : string {
    return jwt.sign({id}, process.env.SECRET_STRING, {
        expiresIn: parseInt(process.env.MAX_TOKEN_AGE ?? '')
    })
}

module.exports.signup_post = async (req:any, res:any) => {

    const email:string = req.body.email
    const nickname:string = req.body.nickname
    const password:string = req.body.password

    if (email === undefined 
        || password === undefined 
        || nickname === undefined) {
        res.status(422).json({error: "Invalid POST request"})
        return
    }
    if (! isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,})) {
            res.status(422).json({error: "Given password is not strong"})
            return
        }
    if (! isEmail(email)) {
        res.status(422).json({error:"Given e-mail is not valid"})
        return
    }
    if (! /^[0-9a-zA-Z_-]*$/.test(nickname)) {
        res.status(422).json({error:"Given nickname contains forbidden characters"})
        return
    }
    const user_same_email = await User.findOne({email})
    const user_same_nickname = await User.findOne({nickname})
    if (user_same_email) {
        res.status(422).json({error:"There already exist an user with given e-mail"})
        return
    }
    if (user_same_nickname) {
        res.status(422).json({error:"There already exist an user with given nickname"})
        return
    }

    await User.create({email, nickname, password: await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALTROUNDS ?? ''))})

    res.json({success: true})

}


module.exports.login_post = async (req:any, res:any) => {

    const email:string = req.body.email
    const password:string = req.body.password

    try {
        const user = await User.login(email, password)
        const token = createToken(user._id);
        res.cookie('jwt', token, {httponly: true, maxAge: parseInt(process.env.MAX_TOKEN_AGE ?? '') * 1000})
        res.json({user: user.nickname})
    }
    catch (err) {
        res.status(400).send({error: "Incorrect e-mail or password"})
    }
}

module.exports.currentUser_get = (req: Request, res: Response) => {
    if (!res.locals?.loggedUser) {
        res.json()
        return
    }

    const user = {
        email: res.locals.loggedUser.email,
        nickname: res.locals.loggedUser.nickname,
        id: res.locals.loggedUser._id,
        role: res.locals.loggedUser.role
    }
    res.json(user)
}
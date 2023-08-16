var { isStrongPassword, isEmail } = require('validator')
var bcrypt = require('bcrypt')
var User = require('../models/User')
var jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
var { secretString, maxTokenAge, saltrounds } = require ("../globalVariables")

// function that creates a token for newly singned up or logged in users
function createToken(id:string) : string {
    return jwt.sign({id}, secretString, {
        expiresIn: maxTokenAge
    })
}

// signup_get just renders the signup page
module.exports.signup_get = (req:any, res:any) => {
    res.render('auth/signup')
}

// signup_post manages data that are send by POST method
// if data is valid creates a user and saves it to the database
// additionally is responsible for hashing the password
module.exports.signup_post = async (req:any, res:any) => {
    // deletes all the users
    // User.collection.deleteMany({})

    const email:string = req.body.email
    const nickname:string = req.body.nickname
    const password:string = req.body.password
    // if either email or password are undefined, it means that an incorrect POST request was send
    if (email === undefined 
        || password === undefined 
        || nickname === undefined) {
        res.status(422).send({error: "Invalid POST request"})
        return
    }
    // checking if the given password meets safe password requirements
    if (! isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,})) {
            res.status(422).send({error: "Given password is not strong"})
            return
        }
    // chcecking if the given email is valid
    if (! isEmail(email)) {
        res.status(422).send({error:"Given e-mail is not valid"})
        return
    }
    // checking if the given nickname consists only of letters, digits and 
    // "-" and "_" symbols
    if (! /^[0-9a-zA-Z_-]*$/.test(nickname)) {
        res.status(422).send({error:"Given nickname contains forbidden characters"})
        return
    }
    // hashing the password
    let hashed_password = await bcrypt.hash(password, saltrounds)
    // trying to create user in the database - if any error occurres, it 
    // means that the passed data is invalid
    try {
        const user = await User.create({email, nickname, password: hashed_password})
        const token = createToken(user._id);
        res.cookie('jwt', token, {httponly: true, maxAge: maxTokenAge * 1000,overwrite:true, secure:false})
        res.status(201).json({user: user.nickname})
    } 
    catch (err:any) {
        // that code means that the given email or username is not unique - there already exist an user 
        // with that email or nickname
        if (err.code === 11000) {
            if (err.message.includes("email")) {
                res.status(422).send({error:"There already exist an user with given e-mail"})
            }
            else if (err.message.includes("nickname")) {
                res.status(422).send({error:"There already exist an user with given nickname"})
            }
            else {
                res.status(422).send({error: "Unknown duplicate error"})
            }
            return
        }
        res.status(400).send({error: "User not created, try sending the form again"})
    }

}

// login_get just renders the login page
module.exports.login_get = (req:any, res:any) => {
    res.render('auth/login')
}

// manages login attempts
// creates a JWT iF logging if succedes
module.exports.login_post = async (req:any, res:any) => {

    const email:string = req.body.email
    const password:string = req.body.password

    try {
        const user = await User.login(email, password)
        const token = createToken(user._id);
        res.cookie('jwt', token, {httponly: true, maxAge: maxTokenAge * 1000})
        res.status(201).json({user: user.nickname})
    }
    catch (err) {
        res.status(400).send({error: "Incorrect e-mail or password"})
    }
}

// logging out the user
module.exports.logout_get = (req:any, res:any) => {
    res.cookie('jwt', '', {maxAge: 1})
    res.redirect('/')
}
var { isStrongPassword, isEmail } = require('validator')
var bcrypt = require('bcrypt')
var User = require('../models/User')
var jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
var nodemailer = require('nodemailer')
var { secretString, maxTokenAge, saltrounds, hostEmailAddress, hostEmailPassword } = require ("../globalVariables")
require('dotenv').config()

function createToken(id:string) : string {
    return jwt.sign({id}, secretString, {
        expiresIn: maxTokenAge
    })
}

// logs in into the email service
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_ADDRESS,
        pass: process.env.MAILER_PASSWORD
    }
});

// signup_get just renders the signup page
module.exports.signup_get = (req:any, res:any) => {
    if (res.locals.loggedUser) {
        res.redirect('/')
    }
    res.render('auth/signup')
}

// signup_post manages data that are send by POST method
// if data is valid creates a user and saves it to the database
// additionally is responsible for hashing the password
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
    // checking it there already is an user with given email or nickname
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

    const token = jwt.sign({email, nickname, password}, secretString, { expiresIn: '10m' })

    const mailConfigurations = {
  
        from: process.env.MAILER_ADDRESS,
      
        to: email,
      
        subject: 'Validate your email address',
          
        text: `Hello ${nickname}!\nThere is only one step left to complete your Gatopedia registration. You only need to veryfy your email address. You can do it by simply clicking this link: http://localhost:3000/auth/verify/${token}`
          
    };
      
    transporter.sendMail(mailConfigurations, function(error:any, info:any){
        if (error) {
            console.log(error.message)
            res.status(500).json({error:"Internal server error"})
        }
        else {
            res.status(201).send('success?')
        }
    });

}

module.exports.login_get = (req:any, res:any) => {
    if (res.locals.loggedUser) {
        res.redirect('/')
    }
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

module.exports.verify_get = (req:any, res:any) => {
    res.render('auth/verify')
}

module.exports.verifyToken_get = (req:any, res:any) => {

    const verifyToken = req.params.verifyToken

    if(verifyToken) {
        jwt.verify(verifyToken, secretString,async (err:any, decodedToken: any) => {
            if (err) {
                console.log(err.message)
                res.status(500).redirect('/error500')
                return
            }
            try {
                // hashing the password
                decodedToken.password = await bcrypt.hash(decodedToken.password, saltrounds)

                const user = await User.create(decodedToken)
                res.status(201).redirect(`/auth/successful-verification`)
            } 
            catch (err:any) {
                console.log(err.message)
                res.status(500).redirect('/error500')
                return
            }

        })
    }
}

module.exports.successfulVerification_get = (req:any, res:any) => {
    res.render('auth/successfulEmailVerification')
}

module.exports.forgotPassword_get = (req:any, res:any) => {
    if (res.locals.loggedUser) {
        res.redirect('/')
    }
    res.render('auth/forgotPassword')
}

module.exports.forgotPassword_post = async (req:any, res:any) => {

    if (res.locals.loggedUser) {
        return
    }

    try {
        const email = req.body.email

        if (!email || !isEmail(email)) {
            res.status(400).json({error: 'Given email is invalid'})
            return
        }

        const user = await User.findOne({email})

        if (!user) {
            res.status(400).json({error: 'There is no user with given email'})
            return
        }

        const token = jwt.sign({id: user._id}, secretString, { expiresIn: '10m' })

        const mailConfigurations = {
    
            from: process.env.MAILER_ADDRESS,
        
            to: email,
        
            subject: 'Reset your password',
            
            text: `Hello ${user.nickname}!\n There has been a request to change a password tied to your Gatopedia account.\nYou can change your password by following this link: http://localhost:3000/auth/forgot-password/${token}\nIf it wasn't you who made this request, just ignore this message\nHave a great day!\nGatopedia`
            
        };
        
        transporter.sendMail(mailConfigurations, function(error:any, info:any){
            if (error) {
                console.log(error.message)
                res.status(500).json({error:"Internal server error"})
            }
            else {
                res.status(201).send('success?')
            }
        });


    }
    catch (err:any) {
        console.log(err.message)
        res.status(500).json({error:"Internal server error"})
    }

}

module.exports.forgotPasswordWithToken_get = async (req:any, res:any) => {
    const verifyToken = req.params.verifyToken

    if(verifyToken) {
        jwt.verify(verifyToken, secretString, async (err:any, decodedToken: any) => {
            if (err) {
                console.log(err.message)
                res.status(500).redirect('/error500')
                return
            }
            try {

                const user = await User.findById(decodedToken.id)

                if (!user) {
                    res.status(500).redirect('/error500')
                    return
                }

                res.status(200).render('auth/forgotPasswordWithToken', {user})

            } 
            catch (err:any) {
                console.log(err.message)
                res.status(500).redirect('/error500')
                return
            }

        })
    } 
}
module.exports.forgotPasswordWithToken_post = async (req:any, res:any) => {
    const verifyToken = req.params.verifyToken

    if(verifyToken) {
        jwt.verify(verifyToken, secretString, async (err:any, decodedToken: any) => {
            if (err) {
                console.log(err.message)
                res.status(500).redirect('/error500')
                return
            }
            try {

                const user = await User.findById(decodedToken.id)

                if (!user) {
                    res.status(500).redirect('/error500')
                    return
                }

                const new_password = req.body.password
                
                if (! isStrongPassword(new_password, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,}) 
                    || new_password.length > 50) {
                        res.status(422).json({error: "Given password is not strong"})
                        return
                    }

                user.password = await bcrypt.hash(new_password, saltrounds)
                user.save()

                res.status(201).send('success')

            } 
            catch (err:any) {
                console.log(err.message)
                res.status(500).redirect('/error500')
                return
            }

        })
    } 
}
var jwt = require('jsonwebtoken')
var User = require('../models/User')
require('dotenv').config()

// used to protect some views from being accessed by an unauhtorised users
module.exports.requireAuth = async (req:any, res:any, next:any) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, process.env.SECRET_STRING, async (err:any, decodedToken:any): Promise<void> => {
            if (err) {
                res.redirect('/auth/login')
                return
            }
            else {
                try {
                    const user = await User.findById({_id: decodedToken.id})
                    if (!user) {
                        res.redirect('/auth/login')
                        return
                    }
                }
                catch (err) {
                    console.log(err)
                    res.redirect('/auth/login')
                    return
                }
                next()
            }
        })
    }
    else {
        res.redirect('/auth/login')
    }
}

module.exports.requireAuthDoctor = async (req:any, res:any, next:any) => {
    const user = res.locals.loggedUser;

    if (user.role !== "doctor") {
      res.status(403).json({
        success: false,
        message: "The currently logged user is not a doctor",
      });
      return;
    }

    next();
}

// chcecks the currently logged user and sends their data to the view
module.exports.checkUser = async (req:any, res:any, next:any): Promise<void> => {
    const token = req.cookies.jwt

    if (token) {
        // refresh cookies' expiry time
        res.cookie('jwt', token, {httponly: true, maxAge: parseInt(process.env.MAX_TOKEN_AGE ?? '') * 1000,overwrite:true, secure:false})

        jwt.verify(token, process.env.SECRET_STRING, async (err:any, decodedToken:any): Promise<void> => {
            if (err) {
                res.locals.loggedUser = null
                next()
            }
            else {
                let user = await User.findById(decodedToken.id)
                res.locals.loggedUser = user
                next()
            }
        })
    }
    else {
        res.locals.loggedUser = null
        next()
    }
}

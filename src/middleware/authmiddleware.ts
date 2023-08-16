var jwt = require('jsonwebtoken')
var User = require('../models/User')
var { secretString, maxTokenAge } = require('../globalVariables')

// used to protect some views from being accessed by an unauhtorised users
module.exports.requireAuth = async (req:any, res:any, next:any) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
            if (err) {
                res.redirect('/auth/login')
            }
            else {
                next()
            }
        })
    }
    else {
        res.redirect('/auth/login')
    }
}

// chcecks the currently logged user and sends their data to the view
module.exports.checkUser = async (req:any, res:any, next:any): Promise<void> => {
    const token = req.cookies.jwt

    if (token) {
        // refresh cookies' expiry time
        res.cookie('jwt', token, {httponly: true, maxAge: maxTokenAge * 1000,overwrite:true, secure:false})

        jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
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

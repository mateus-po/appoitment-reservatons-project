var mongoose = require('mongoose')
var User = require('../models/User')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var fs = require('fs')
var { secretString, saltrounds, absolutePath } = require('../globalVariables')
var { isStrongPassword, isEmail } = require('validator')
import { Request, Response } from "express";


// displays a user page view with appropriate user data
module.exports.userPage_get = async (req:any, res:any) => {
    const user = await User.findOne({'nickname': req.params.username})

    if (user === null) res.status(404).redirect('/error404')

    if (user.recentlyEditedArticles) {
    let {article_titles, article_urls, article_time} = JSON.parse(user.recentlyEditedArticles)

    res.render('user/userPage', {user, article_titles, article_urls, article_time})
    }
    else {
        let article_titles = undefined
        let article_urls = undefined
        let article_time = undefined
    res.render('user/userPage', {user, article_titles, article_urls, article_time})
    }
}

// displays an user edit page
module.exports.userEdit_get = async (req:any, res:any) => {
    res.render('user/userEdit')
}
module.exports.userEdit_post = async (req:any, res:any) => {

    const token = req.cookies.jwt
    const newEmail = req.body.email
    const newNickname = req.body.nickname
    const newDescription = req.body.description
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    
    if (token) {
        jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
            if (!err) {
                if (newEmail) {
                    try {
                        const user = await User.findById(decodedToken.id)
                        if (newEmail == user.email) {
                            res.status(400).send({error:'Given e-mail is the same as the previous e-mail'})
                            return
                        }
                        if (!isEmail(newEmail)) {
                            res.status(400).send({error: `${newEmail} is not a correct e-mail`})
                            return
                        }
                        await User.findOneAndUpdate({_id: decodedToken.id,}, {email: newEmail})
                        res.status(201).send("success")
                    }
                    catch (err:any) {
                        // if error has code 11000 it means that there already is an user with the new email
                        if (err.code == 11000) {
                            res.status(400).send({error: "There already exists an user with that email"})
                            return
                        }
                        res.status(400).send({error: err.message})
                    }   
                }
                else if (newNickname) {
                    try {
                        const user = await User.findById(decodedToken.id)
                        if (newNickname == user.nickname) {
                            res.status(400).send({error:'Given nickname is the same as the previous nickname'})
                            return
                        }
                        if (!/^[a-zA-Z0-9_-]*$/.test(newNickname)) {
                            res.status(400).send({error: "Nickname consists of forbidden characters"})
                            return
                        }
                        await User.findOneAndUpdate({_id: decodedToken.id,}, {nickname: newNickname})
                        res.status(201).send("success")
                    }
                    catch (err:any) {
                        // if error has code 11000 it means that there already is an user with the new nickname
                        if (err.code == 11000) {
                            res.status(400).send({error: "There already exists an user with that nickname"})
                            return
                        }
                        res.status(400).send({error: err.message})
                    }
                }
                else if (newDescription) {
                    try {
                        const user = await User.findById(decodedToken.id)
                        if (newDescription == user.description) {
                            res.status(400).send({error:'Given description is the same as the previous description'})
                            return
                        }
                        await User.findOneAndUpdate({_id: decodedToken.id,}, {description: newDescription})
                        res.status(201).send("success")
                    }
                    catch (err:any) {
                        res.status(400).send({error: err.message})
                    }
                }
                else if (newPassword && oldPassword) {
                    try {
                        const user = await User.findById(decodedToken.id)
                        if (! await bcrypt.compare(oldPassword, user.password)) {
                            res.status(400).send({error:'Given current password is incorrect'})
                            return
                        }
                        if (! isStrongPassword(newPassword, {
                            minLength: 8,
                            minLowercase: 1,
                            minUppercase: 1,
                            minNumbers: 1,
                            minSymbols: 1,})) {
                                res.status(400).send({error: "Given password is not strong"})
                                return
                            }
                        let hashed_password = await bcrypt.hash(newPassword, saltrounds)
                        await User.findOneAndUpdate({_id: decodedToken.id,}, {password: hashed_password})
                        res.status(201).send("success")
                    }
                    catch (err:any) {
                        res.status(400).send({error: err.message})
                    }
                }
                else {
                    res.status(400).send({error: "Invalid request"})
                }
                
            }
            else {
                res.redirect('/auth/login')
            }

        })
    }
    else {
        res.redirect('/auth/login')
    }
}

// deletes user from database, the article posted by user stay intact
module.exports.userDelete = async (req:any, res:any) => {
    const token = req.cookies.jwt

    if (!token) {
        res.redirect('/auth/login')
        return
    }

    jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
        if (err) {
            res.redirect('/auth/login')

            return
        }

        try {
            const user = await User.findById({_id: decodedToken.id})

            if (user.avatarPath) {
                if (fs.existsSync( absolutePath + "/public" + user.avatarPath )) {
                    fs.unlinkSync(absolutePath + "/public" + user.avatarPath)
                }
            }

            const username = user.nickname

            await user.deleteOne()
            res.status(201).send(username)
        }
        catch (err:any) {
            console.log(err.message)

            res.redirect('/auth/login')
            return
        }

    })

}

module.exports.userEditAvatar_post = (req:any, res:any) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, secretString, async (err:any, decodedToken:any): Promise<void> => {
            if (!err) {
                try {
                    const user = await User.findById(decodedToken.id)
                    if (user.avatarPath) {
                        if (fs.existsSync( absolutePath + "/public" + user.avatarPath )) {
                            fs.unlinkSync(absolutePath + "/public" + user.avatarPath)
                        }
                    }
                    await User.findOneAndUpdate({_id: decodedToken.id,}, {avatarPath: `/img/userAvatars/${req.file.filename}`})
                    res.status(201).send("success")
                }
                catch (err:any) {
                    console.log(err)
                    res.status(424).json({error: "there was a problem uploading the new avatar"})
                }    
            }
            else {

                res.redirect('/auth/login')
            }

        })
        
    }
    else {
        res.redirect('/auth/login')
    }
}

module.exports.displayUsers_get = async (req:any, res:any) => {
    const users = await User.find({}, 'nickname description avatarPath')
    res.json(users)
}

module.exports.doctors_get = async (req:Request, res:Response) => {
    const users = await User.find({role: 'doctor'}, '_id nickname description role')
    const response = users.map((u:any) => {
        return {id: u._id, nickname: u.nickname, description: u.description, role: u.role}
    })
    res.json(response)
}
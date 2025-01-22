var mongoose = require("mongoose")
var {isEmail, isAlphanumeric} = require("validator")
var bcrypt = require('bcrypt')

const UserModel = new mongoose.Schema({
    email: {
        type: String,
        required: [true,"E-mail address is required"],
        unique: [true, "There already exists an user with given e-mail"],
        lowercase: true,
        validate: [isEmail, "Given e-mail is invalid"],
        index: true
    },
    nickname: {
        type: String,
        required: [true, "Nickname is required"], 
        unique: true, 
        validate: [(val:string) => { return /^[0-9a-zA-Z_-]*$/.test(val)}, "Given nickname is invalid"],
        index: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        maxLength: 800
    },
    role: {
        type: String,
        required: true,
        maxLength: 30,
        default: 'user'
    }
})

// it tries to find a user with matching email and password in the database
UserModel.statics.login = async function (email:string, password:string):Promise <{_id:string, email:string, nickname:string, password:string}> {

    const user = await User.findOne({email: email}, "_id email nickname password")

    if (user === null) {
        throw Error('incorrect e-mail')
    }
    if (! await bcrypt.compare(password, user.password)) {
        throw Error('incorrect password')
    }
    return user
}

var User = mongoose.model('user', UserModel)

module.exports = User
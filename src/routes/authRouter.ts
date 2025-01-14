// this file contains routes used in user authentication

var express = require('express')
var router = express.Router();
const authController = require('../controllers/authController')


router.post('/login', authController.login_post)

router.post('/signup', authController.signup_post)

router.get('/current_user', authController.currentUser_get)

module.exports = router
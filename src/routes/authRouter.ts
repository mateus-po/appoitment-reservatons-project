// this file contains routes used in user authentication

var express = require('express')
var router = express.Router();
const authController = require('../controllers/authController')


router.get('/login', authController.login_get)

router.get('/signup', authController.signup_get)

router.get('/verify', authController.verify_get)

router.get('/verify/:verifyToken', authController.verifyToken_get)

router.get('/successful-verification', authController.successfulVerification_get)

router.get('/forgot-password', authController.forgotPassword_get)

router.post('/forgot-password', authController.forgotPassword_post)

router.get('/forgot-password/:verifyToken', authController.forgotPasswordWithToken_get)

router.post('/forgot-password/:verifyToken', authController.forgotPasswordWithToken_post)

router.post('/login', authController.login_post)

router.post('/signup', authController.signup_post)

router.get('/logout', authController.logout_get)

router.get('/current_user', authController.currentUser_get)

module.exports = router
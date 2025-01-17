var express = require('express')
var router = express.Router();
var userController = require('../controllers/usersController')

router.get('/doctors', userController.doctors_get)

module.exports = router
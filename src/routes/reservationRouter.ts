var express = require('express')
var router = express.Router();
var reservationsController = require('../controllers/reservationsController')
var { requireAuthDoctor, requireAuth } = require('../middleware/authmiddleware')

router.post('/create', requireAuth, reservationsController.createReservation_post)


module.exports = router
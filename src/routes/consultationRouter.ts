var express = require('express')
var router = express.Router();
var consultationController = require('../controllers/consultationController')
var { requireAuth } = require('../middleware/authmiddleware')

router.get('/', consultationController.consultations_get)
router.get('/as_doctor', consultationController.consultationsAsDoctor_get)
router.post('/create', requireAuth, consultationController.createConsultation_post)
router.post('/add/one-time', requireAuth, consultationController.createOneTimeConsultations_post)

module.exports = router
var express = require('express')
var router = express.Router();
var consultationController = require('../controllers/consultationController')
var { requireAuthDoctor } = require('../middleware/authmiddleware')

router.get('/', consultationController.consultations_get)
router.get('/as_doctor', requireAuthDoctor, consultationController.consultationsAsDoctor_get)
router.post('/create', requireAuthDoctor, consultationController.createConsultation_post)
router.post('/add/one-time', consultationController.createOneTimeConsultations_post)
router.post('/add/absence', requireAuthDoctor, consultationController.createAbsence_post)

module.exports = router
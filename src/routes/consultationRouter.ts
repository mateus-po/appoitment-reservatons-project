var express = require('express')
var router = express.Router();
var consultationController = require('../controllers/consultationController')
var { requireAuthDoctor, requireAuth } = require('../middleware/authmiddleware')

router.get('/as_doctor', requireAuthDoctor, consultationController.consultationsAsDoctor_get)
router.get('/as_user', requireAuth, consultationController.consultationsAsUser_get)
router.post('/create', requireAuthDoctor, consultationController.createConsultation_post)
router.post('/add/one-time', consultationController.createOneTimeConsultations_post)
router.post('/add/absence', requireAuthDoctor, consultationController.createAbsence_post)

module.exports = router
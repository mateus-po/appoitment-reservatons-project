var mongoose = require("mongoose")

const ConsultationModel = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    timeslot: {
        type: Number,
        required: true
    },
    doctorId: {
        type: mongoose.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum : ['consultation','absence'],
        default: 'consultation'
    },
    reservationId: {
        type: mongoose.ObjectId,
        required: false
    }
})

var Consultation = mongoose.model('consultation', ConsultationModel)

module.exports = Consultation
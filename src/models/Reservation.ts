var mongoose = require("mongoose");

const ReservationModel = new mongoose.Schema({
  firstConsultationId: {
    type: mongoose.ObjectId,
    required: false,
    index: true,
  },
  consultationLength: {
    type: Number,
    required: true
  },
  consultationType: {
    type: String,
    required: true,
  },
  patientData: {
    name: {
      type: String,
      required: true,
      maxLength: 200,
    },
    gender: {
      type: String,
      required: true,
      maxLength: 20,
    },
    age: {
      type: Number,
      required: true,
    },
  },
  note: {
    type: String,
    required: false,
    maxLength: 1000,
  },
});

var Reservation = mongoose.model("reservation", ReservationModel);

module.exports = Reservation;

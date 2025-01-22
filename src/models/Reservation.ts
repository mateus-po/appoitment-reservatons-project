var mongoose = require("mongoose");

const ReservationModel = new mongoose.Schema({
  firstConsultationId: {
    type: mongoose.ObjectId,
    required: false,
    index: true,
  },
  userId: {
    type: mongoose.ObjectId,
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.ObjectId,
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeslot: {
    type: Number,
    required: true,
  },
  consultationLength: {
    type: Number,
    required: true,
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
  cancelled: {
    type: Boolean,
    required: true,
    default: false,
  },
});

var Reservation = mongoose.model("reservation", ReservationModel);

module.exports = Reservation;

var mongoose = require("mongoose");

const ReservationModel = new mongoose.Schema({
  consultationId: {
    type: mongoose.ObjectId,
    required: false,
    index: true,
  },
  length: {
    type: mongoose.Schema.Types.Int32,
    required: true,
  },
  consulatationType: {
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
      type: mongoose.Schema.Types.Int32,
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

var dayjs = require("dayjs");
// @ts-ignore
import dayjsPluginUTC from "dayjs-plugin-utc";
dayjs.extend(dayjsPluginUTC);
var Consultation = require("../../models/Consultation");
var Reservation = require('../../models/Reservation')
var ServiceError = require('../errors/ServiceError')

type CreateReservationArguments = {
  consultationLength: number;
  consultationType: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
  doctorNotes: string;
  doctorId: string;
  startDate: string;
  startTimeSlot: string;
  offset: number;
  userId: string;
};

const createReservation = async (data: CreateReservationArguments) => {
  const {
    consultationLength,
    consultationType,
    patientName,
    patientGender,
    patientAge,
    doctorNotes,
    doctorId,
    startDate,
    startTimeSlot,
    offset,
    userId,
  } = data;

  let start = dayjs
    .utc(startDate)
    .hour(startTimeSlot.split(":")[0])
    .minute(startTimeSlot.split(":")[1])
    .add(offset, "minutes");

  let end = start.add(consultationLength * 30, "minutes");

  const existing_consultations = await Consultation.find({
    doctorId,
    date:
      start.date() == end.date()
        ? start.toISOString().replace(/T.*/, "")
        : [
            start.toISOString().replace(/T.*/, ""),
            end.toISOString().replace(/T.*/, ""),
          ],
  });

  let consultationsToUpdate = [];

  while (start.isBefore(end)) {
    const newDate = start.toISOString().replace(/T.*/, "");

    const t = start.hour() * 2 + (start.minute() == 30 ? 1 : 0);

    const consultation = existing_consultations.find(
      (c: any) =>
        c.date == newDate &&
        c.timeslot == t &&
        !c.reservationId &&
        c.type == "consultation"
    );
    if (!consultation) {
      throw new ServiceError("There is a conflict, could not create a reservation");
    }

    consultationsToUpdate.push(consultation)

    start = start.add(30, 'minutes')
  }

  for (let c of consultationsToUpdate) {
    const reservation = await Reservation.create({
        consultationId: c._id,
        consultationType,
        patientData: {
            name: patientName,
            gender: patientGender,
            age: patientAge
        },
        note: doctorNotes
    })
    c.reservationId = reservation._id
    await c.save()

  }
};

module.exports = createReservation;

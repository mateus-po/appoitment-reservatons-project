var Consultation = require("../../models/Consultation");
var Reservation = require("../../models/Reservation");
var dayjs = require("dayjs");
// @ts-ignore
import dayjsPluginUTC from "dayjs-plugin-utc";
dayjs.extend(dayjsPluginUTC);

const consultationsForDoctor = async (
  doctorId: string,
  startDate: string,
  endDate: string
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const all_consultations = await Consultation.find({ doctorId });
  const consultationsSelectedPeriod = all_consultations.filter(
    (consultation: typeof Consultation) => {
      const hour = Math.floor(consultation.timeslot / 2);
      const consultationDate = new Date(
        Date.parse(
          consultation.date +
            `T${hour > 9 ? hour : "0" + hour}:${
              consultation.timeslot % 2 == 1 ? "30" : "00"
            }:00.000Z`
        )
      );
      return (
        start.getTime() <= consultationDate.getTime() &&
        consultationDate.getTime() <= end.getTime()
      );
    }
  );

  const reservations = await Reservation.find({
    _id: consultationsSelectedPeriod
      .map((c: any) => c.reservationId)
      .filter(onlyUnique),
  });

  const normalizedConsultations = consultationsSelectedPeriod.map((c: any) => {
    const consultationObject = c.toObject();
    consultationObject.reserved = !!consultationObject.reservationId;
    if (consultationObject.reservationId) {
      consultationObject.reservation = reservations.find(
        (r: any) => r._id.toString() === c.reservationId.toString()
      );
    }
    return consultationObject;
  });
  return normalizedConsultations;
};

function onlyUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index;
}

module.exports = consultationsForDoctor;

var Consultation = require("../../models/Consultation");
var dayjs = require("dayjs");
// @ts-ignore
import dayjsPluginUTC from "dayjs-plugin-utc";
dayjs.extend(dayjsPluginUTC);

const createAbsence = async (
  doctorId: string,
  startDate: string,
  endDate: string,
  offset: number
) => {
  let start = dayjs
    .utc(startDate)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .add(offset, "minutes");
  const end = dayjs
    .utc(endDate)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .add(24, "hours")
    .add(offset, "minutes");

  let consultationsToCreate: { [key: string]: number[] } = {};

  while (start.isBefore(end)) {
    const newDate = start.toISOString().replace(/T.*/, "");

    if (!consultationsToCreate[newDate]) {
      consultationsToCreate[newDate] = [];
    }

    const t = start.hour() * 2 + (start.minute() == 30 ? 1 : 0);

    consultationsToCreate[newDate].push(t);

    start = start.add(30, "minutes");
  }

  const existing_consultations = await Consultation.find({
    doctorId,
    date: Object.keys(consultationsToCreate),
  });

  const conflicting_consultations_without_reservation =
    existing_consultations.filter(
      (c: any) =>
        consultationsToCreate[c.date].includes(c.timeslot) && !c.reservationId
    );

  // TODO: find the conflicting consultations with reservations and cancel them

  await Consultation.deleteMany({
    _id: conflicting_consultations_without_reservation.map((c: any) => c._id),
  });

  let promises: Promise<Object>[] = []
    
  Object.entries(consultationsToCreate).forEach(([date, timeslots]) => {
      timeslots.forEach(t =>
          promises.push(Consultation.create({
              doctorId,
              date: date,
              timeslot: t,
              type: 'absence'
            }))
      )
  })

  await Promise.all(promises)
};

module.exports = createAbsence;

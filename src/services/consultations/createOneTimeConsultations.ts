var Consultation = require("../../models/Consultation");
var dayjs = require("dayjs");
// @ts-ignore
import dayjsPluginUTC from "dayjs-plugin-utc";
dayjs.extend(dayjsPluginUTC);

type Timeslot = {
  start: string;
  end: string;
};

const createOneTimeConsultations = async (
  doctorId: string,
  date: string,
  timeSlots: Timeslot[],
  offset: number
) => {
  let consultationsToCreate: {[key: string]: number[]} = {};

  timeSlots.forEach((timeslot) => {
    let startDate = dayjs
      .utc(date)
      .hour(timeslot.start.split(":")[0])
      .minute(timeslot.start.split(":")[1])
      .add(offset, "minutes");
    const endDate = dayjs
      .utc(date)
      .hour(timeslot.end.split(":")[0])
      .minute(timeslot.end.split(":")[1])
      .add(offset, "minutes");


    while(startDate.isBefore(endDate)) {
        const newDate = startDate.toISOString().replace(/T.*/, '')

        if (!consultationsToCreate[newDate]) {
            consultationsToCreate[newDate] = []
        }

        const t = startDate.hour() * 2 + (startDate.minute() == 30 ? 1 : 0)

        consultationsToCreate[newDate].push(t)

        startDate = startDate.add(30, 'minutes')
    }

  });

    const existing_consultations = await Consultation.find({
      doctorId,
      date: Object.keys(consultationsToCreate),
    });

    for (let c of existing_consultations) {
      if (consultationsToCreate[c.date].includes(c.timeslot)) {
        const index = consultationsToCreate[c.date].indexOf(c.timeslot)
        consultationsToCreate[c.date].splice(index, 1)
      }
    }
    
    let promises: Promise<Object>[] = []
    
    Object.entries(consultationsToCreate).forEach(([date, timeslots]) => {
        timeslots.forEach(t =>
            promises.push(Consultation.create({
                doctorId,
                date: date,
                timeslot: t,
              }))
        )
    })

    await Promise.all(promises)
};

module.exports = createOneTimeConsultations;

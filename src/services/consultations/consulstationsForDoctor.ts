var Consultation = require("../../models/Consultation");
var dayjs = require("dayjs");
// @ts-ignore
import dayjsPluginUTC from "dayjs-plugin-utc";
dayjs.extend(dayjsPluginUTC);

const consultationsForDoctor = async (
  doctorId: string,
  startDate: string,
  endDate: string
) => {
  console.log(startDate, endDate)
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
      return start.getTime() <= consultationDate.getTime() && consultationDate.getTime() <= end.getTime();
    }
  );
  return consultationsSelectedPeriod;
};

module.exports = consultationsForDoctor;

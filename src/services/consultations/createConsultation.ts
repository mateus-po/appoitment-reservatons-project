var Consultation = require("../../models/Consultation");

const parseDate = (date: string) => {
  const parsedDate = new Date(date + "T00:00:00.000Z");

  const day = parsedDate.getUTCDate();
  const month = parsedDate.getUTCMonth() + 1;
  const year = parsedDate.getUTCFullYear();

  return `${year}-${month > 9 ? month : "0" + month}-${
    day > 9 ? day : "0" + day
  }`;
};

const createConsultation = async (
  doctorId: string,
  date: string,
  timeslot_start: number,
  timeslot_end: number
) => {
  if (!/^[\d]{4}-[\d]{2}-[\d]{2}$/.test(date)) {
    throw Error(
      "Invalid date format - the endpoint expects a date in the YYYY-MM-DD format"
    );
  }

  if (
    timeslot_start < 0 ||
    timeslot_start > 48 ||
    timeslot_end < 0 ||
    timeslot_end > 48 ||
    timeslot_start > timeslot_end
  ) {
    throw Error("Specified timeslots are invalid");
  }

  const existing_consultations = await Consultation.find({
    doctorId,
    date: parseDate(date),
  });

  const conflicting_constultations_exist = existing_consultations.some(
    (c: any) => c.timeslot >= timeslot_start && c.timeslot <= timeslot_end
  );

  if (conflicting_constultations_exist) {
    throw Error(
      "There already exist consultations that conflict with the newly created ones"
    );
  }

    let current_timeslot = timeslot_start;
    while (current_timeslot <= timeslot_end) {
      await Consultation.create({
        doctorId,
        date: parseDate(date),
        timeslot: current_timeslot++,
      });
    }
};

module.exports = createConsultation;

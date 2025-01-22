var Reservation = require("../../models/Reservation");
var User = require("../../models/User");

const getReservationsForUser = async (userId: string) => {
  const user_reservations = await Reservation.find({ userId });
  const doctor_ids = user_reservations
    .map((r: any) => r.doctorId)
    .filter((n: any) => n)
    .filter(onlyUnique);

  let relatedDoctors: any[] = [];

  await Promise.all([
    User.find({ _id: doctor_ids })
  ]).then(([doctors]) => {
    relatedDoctors = doctors;
  });

  const response = user_reservations.map((r: any) => {
    const reservation = r.toObject();
    const doctor = relatedDoctors.find((d: any) =>
      d._id.equals(reservation.doctorId)
    );
    reservation.doctorNickname = doctor.nickname;
    return reservation;
  });

  return response;
};

function onlyUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index;
}

module.exports = getReservationsForUser;

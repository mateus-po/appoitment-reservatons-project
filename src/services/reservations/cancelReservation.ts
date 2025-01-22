var dayjs = require("dayjs");
// @ts-ignore
import dayjsPluginUTC from "dayjs-plugin-utc";
dayjs.extend(dayjsPluginUTC);
var Consultation = require("../../models/Consultation");
var Reservation = require('../../models/Reservation')
var ServiceError = require('../errors/ServiceError')


const cancelReservation = async (reservationId: string, userId: string
) => {
    const reservation = await Reservation.findById(reservationId)

    if (!reservation || !reservation.userId.equals(userId)) {
        throw new ServiceError('Could not cancel this reservation')
    }

    const consultations = await Consultation.find({reservationId})
    consultations.forEach((c:any) => {
        c.reservationId = null
        c.save()
    })

    reservation.cancelled = true
    reservation.firstConsultationId = null
    reservation.save()
};

module.exports = cancelReservation;

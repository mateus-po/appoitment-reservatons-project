import { Request, Response } from "express";
var getReservationForUser = require('../services/reservations/getReservationsForUser')
var createReservation = require('../services/reservations/createReservation')
var cancelReservation = require('../services/reservations/cancelReservation')
var reservationTypes = require('../services/reservations/reservationTypes')
var ServiceError = require('../services/errors/ServiceError')

module.exports.createReservation_post = async (req: Request, res: Response) => {
  const userId = res.locals.loggedUser._id;

    try {
        await createReservation({...req.body, userId})
    } catch(e: any) {
        if (e instanceof ServiceError) {
            res.status(422).json({error: e.message})
            return
           } else {
             throw e;
           }
    }

  res.json({what: 'a success'})


};

module.exports.cancelReservation_post = async (req: Request, res: Response) => {
  const userId = res.locals.loggedUser._id;
  const { reservationId } = req.body

    try {
        await cancelReservation(reservationId, userId)
    } catch(e: any) {
        if (e instanceof ServiceError) {
            res.status(422).json({error: e.message})
            return
           } else {
             throw e;
           }
    }

  res.json({what: 'a success'})


};

module.exports.getReservationTypes_get = (req: Request, res: Response) => {
  res.json(reservationTypes())
};

module.exports.getUserReservations_get = async (req: Request, res: Response) => {
  const userId = res.locals.loggedUser._id;

    try {
        const reservations = await getReservationForUser(userId)
        res.json(reservations)
    } catch(e: any) {
        if (e instanceof ServiceError) {
            res.status(422).json({error: e.message})
            return
           } else {
             throw e;
           }
    }
};

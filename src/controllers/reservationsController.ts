import { Request, Response } from "express";
var createReservation = require('../services/reservations/createReservation')
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

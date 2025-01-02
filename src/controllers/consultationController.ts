var Consultation = require("../models/Consultation");
const createConsultation = require('../services/consultations/createConsultation')
import { Request, Response } from "express";

module.exports.consultations_get = async (req: Request, res: Response) => {
  const all_consultations = await Consultation.find({});
  res.json(all_consultations);
};

module.exports.createConsultation_post = async (
  req: Request,
  res: Response
) => {
  const { date, timeslot_start, timeslot_end } = req.body;
  const user = res.locals.loggedUser;

  if (user.role !== "doctor") {
    res.json({
      success: false,
      message: "The currently logged user is not a doctor",
    });
    return;
  }

  const doctorId = user._id;

  try {
    await createConsultation(doctorId, date, timeslot_start, timeslot_end);
    res.json({ success: true });
  } catch (e: unknown) {
    const message =
      typeof e === "string" ? e : e instanceof Error ? e.message : "";
    res.json({ success: false, message: message });
  }
};

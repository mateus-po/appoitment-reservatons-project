var Consultation = require("../models/Consultation");
const createConsultation = require("../services/consultations/createConsultation");
var consulstationsForDoctor = require("../services/consultations/consulstationsForDoctor");
var createOneTimeConsultations = require("../services/consultations/createOneTimeConsultations");
var createAbsence = require("../services/consultations/createAbsence");
import { Request, Response } from "express";

module.exports.consultations_get = async (req: Request, res: Response) => {
  const all_consultations = await Consultation.find({});
  res.json(all_consultations);
};

module.exports.consultationsAsDoctor_get = async (
  req: Request,
  res: Response
) => {
  const { startDate, endDate } = req.query;
  const doctorId = res.locals.loggedUser._id;

  const consultations = await consulstationsForDoctor(
    doctorId,
    startDate,
    endDate
  );

  res.json(consultations);
};

module.exports.createConsultation_post = async (
  req: Request,
  res: Response
) => {
  const { date, timeslot_start, timeslot_end } = req.body;
  const doctorId = res.locals.loggedUser._id;

  try {
    await createConsultation(doctorId, date, timeslot_start, timeslot_end);
    res.json({ success: true });
  } catch (e: unknown) {
    const message =
      typeof e === "string" ? e : e instanceof Error ? e.message : "";
    res.json({ success: false, message: message });
  }
};

module.exports.createOneTimeConsultations_post = async (
  req: Request,
  res: Response
) => {
  const { date, timeSlots, offset } = req.body;
  const doctorId = res.locals.loggedUser._id;

  try {
    await createOneTimeConsultations(
      doctorId,
      date,
      timeSlots,
      offset
    );
    res.json({ success: true });
  } catch (e: unknown) {
    const message =
      typeof e === "string" ? e : e instanceof Error ? e.message : "";
    res.status(422).json({ success: false, message: message });
  }
};

module.exports.createAbsence_post = async (
  req: Request,
  res: Response
) => {
  const { startDate, endDate, offset } = req.body;
  const doctorId = res.locals.loggedUser._id;

  try {
    await createAbsence(
      doctorId,
      startDate,
      endDate,
      offset
    );
    res.json({ success: true });
  } catch (e: unknown) {
    const message =
      typeof e === "string" ? e : e instanceof Error ? e.message : "";
    res.status(422).json({ success: false, message: message });
  }
};

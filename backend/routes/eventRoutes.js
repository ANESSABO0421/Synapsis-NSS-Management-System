import express from "express";
import {
  assignStudentToEvent,
  createEvents,
  deleteEvent,
  getEventById,
  getEventParticipants,
  getEvents,
} from "../controllers/eventController.js";

const eventRouter = express.Router();

eventRouter.post("/addevent", createEvents);

eventRouter.get("/getevents", getEvents);

eventRouter.get("/geteventsbyid/:id", getEventById);

eventRouter.delete("/deleteevent/:id", deleteEvent);

eventRouter.post("/assigntoevent/:id", assignStudentToEvent);

eventRouter.get("/participantsofevents/:id", getEventParticipants);

export default eventRouter;

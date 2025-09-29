import express from "express";
import {
  assignStudentToEvent,
  createEvents,
  deleteEvent,
  getAllevents,
  getEventById,
  getEventParticipants,
  getEvents,
  updateEvent,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const eventRouter = express.Router();

eventRouter.post("/addevent", protect, createEvents);

eventRouter.get("/getevents", getEvents);

eventRouter.get("/getallevent", getAllevents);

eventRouter.get("/geteventsbyid/:id", getEventById);

eventRouter.delete("/deleteevent/:id", deleteEvent);

eventRouter.post("/assigntoevent/:id", assignStudentToEvent);

eventRouter.get("/participantsofevents/:id", getEventParticipants);

eventRouter.put("/updateevent/:id", updateEvent);

export default eventRouter;

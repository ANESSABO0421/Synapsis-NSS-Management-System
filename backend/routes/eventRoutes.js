import express from "express";
import {
  assignStudentToEvent,
  createEvents,
  deleteEvent,
  deleteEventImage,
  getAllEventImages,
  getAllevents,
  getEventById,
  getEventImages,
  getEventParticipants,
  getEvents,
  updateEvent,
  uploadEventImages,
} from "../controllers/eventController.js";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const eventRouter = express.Router();

eventRouter.post("/addevent", protect, createEvents);

eventRouter.get("/getevents", getEvents);

eventRouter.get("/getallevent", getAllevents);

eventRouter.get("/geteventsbyid/:id", getEventById);

eventRouter.delete("/deleteevent/:id", deleteEvent);

eventRouter.post("/assigntoevent/:id", assignStudentToEvent);

eventRouter.get("/participantsofevents/:id", getEventParticipants);

eventRouter.put("/updateevent/:id", updateEvent);

eventRouter.post(
  "/:id/uploadimages",
  upload.array("images", 10),
  protect,
  teacherOnly,
  uploadEventImages
);

eventRouter.get("/:id/images", getEventImages);

eventRouter.delete("/:id/images/:imageId", deleteEventImage);

eventRouter.get("/getalleventimage", getAllEventImages);

export default eventRouter;

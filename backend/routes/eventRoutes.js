import express from "express";
import {
  assignStudentToEvent,
  completeEvent,
  createEvents,
  deleteEvent,
  deleteEventImage,
  getAllEventImages,
  getAllevents,
  getEventById,
  getEventImages,
  getEventParticipants,
  getEvents,
  startEvent,
  updateEvent,
  uploadEventImages,
} from "../controllers/eventController.js";
import { adminOnly, authorize, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { requireEventAccess } from "../utils/eventAccess.js";
import { getQrToken, qrCheckIn } from "../controllers/attendanceController.js";

const eventRouter = express.Router();

const manager = authorize("admin", "coordinator");
const managerOrTeacher = authorize("admin", "coordinator", "teacher");

// Public (landing page / gallery)
eventRouter.get("/getallevent", getAllevents);
eventRouter.get("/getalleventimage", getAllEventImages);
eventRouter.get("/:id/images", getEventImages);

// Authenticated
eventRouter.post("/addevent", protect, adminOnly, createEvents);
eventRouter.get("/getevents", protect, manager, getEvents);
eventRouter.get("/geteventsbyid/:id", protect, getEventById);

eventRouter.put("/updateevent/:id", protect, manager, requireEventAccess(), updateEvent);
eventRouter.delete("/deleteevent/:id", protect, manager, requireEventAccess(), deleteEvent);
eventRouter.post("/assigntoevent/:id", protect, manager, requireEventAccess(), assignStudentToEvent);

eventRouter.get(
  "/participantsofevents/:id",
  protect,
  managerOrTeacher,
  requireEventAccess({ allowTeacher: true }),
  getEventParticipants
);

// Auth runs BEFORE multer so anonymous requests never reach Cloudinary.
eventRouter.post(
  "/:id/uploadimages",
  protect,
  managerOrTeacher,
  requireEventAccess({ allowTeacher: true }),
  upload.array("images", 10),
  uploadEventImages
);
eventRouter.delete(
  "/:id/images/:imageId",
  protect,
  managerOrTeacher,
  requireEventAccess({ allowTeacher: true }),
  deleteEventImage
);

// QR attendance: rotating code shown by staff, scanned by participants.
eventRouter.get(
  "/:id/qr",
  protect,
  managerOrTeacher,
  requireEventAccess({ allowTeacher: true }),
  getQrToken
);
eventRouter.post("/checkin", protect, authorize("student"), qrCheckIn);

eventRouter.put("/:id/start", protect, authorize("coordinator"), requireEventAccess(), startEvent);
eventRouter.put("/:id/complete", protect, authorize("coordinator"), requireEventAccess(), completeEvent);

export default eventRouter;

import express from "express";
import {
  approveTeacher,
  assignTeacherToEvent,
  teacherLogin,
  teacherSignUp,
  verifyOtp,
  markAttendance,
  assignGraceMark,
  genrateAttendncePdfs
} from "../controllers/teacherController.js";
import upload from "../middleware/uploadMiddleware.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const teacherRoute = express.Router();

teacherRoute.post("/signup", upload.single("profileImage"), teacherSignUp);
teacherRoute.post("/verify-otp", verifyOtp);
teacherRoute.post("/login", teacherLogin);

// Admin actions
teacherRoute.put("/approve/:id", protect, adminOnly, approveTeacher);
teacherRoute.post("/assign-event", protect, adminOnly, assignTeacherToEvent);

// Attendance
teacherRoute.post("/attendance/:eventId", protect, markAttendance);
teacherRoute.get("/attendance/pdf/:eventId", protect, genrateAttendncePdfs);

// Grace marks
teacherRoute.post("/grace-marks", protect, assignGraceMark);

export default teacherRoute;

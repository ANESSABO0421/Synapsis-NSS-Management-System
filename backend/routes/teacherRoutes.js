import express from "express";
import {
  assignTeacherToEvent,
  teacherLogin,
  teacherSignUp,
  verifyOtp,
  markAttendance,
  assignGraceMark,
  genrateAttendncePdfs,
  approveRecommendedGraceMark,
  rejectPendingTeacher,
  getAllPendingTeacher,
  approveTeacher,
  getAllTeacher,
  rejectInDashboardTeacher,
} from "../controllers/teacherController.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  adminOnly,
  protect,
  teacherOnly,
} from "../middleware/authMiddleware.js";
import { approvePendingStudent } from "../controllers/studentController.js";

const teacherRoute = express.Router();

teacherRoute.post(
  "/signup",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "verificationDocument", maxCount: 1 },
  ]),
  teacherSignUp
);
teacherRoute.post("/verify-otp", verifyOtp);
teacherRoute.post("/login", teacherLogin);

// Admin actions
teacherRoute.post("/assign-event", protect, adminOnly, assignTeacherToEvent);

// Attendance
teacherRoute.post("/attendance/:eventId", protect, teacherOnly, markAttendance);
teacherRoute.get(
  "/attendance/pdf/:eventId",
  protect,
  teacherOnly,
  genrateAttendncePdfs
);

// Grace marks
teacherRoute.post("/grace-marks", protect, teacherOnly, assignGraceMark);

// recommended gracemark approve
teacherRoute.put(
  "/approverecommendedgracemark",
  protect,
  teacherOnly,
  approveRecommendedGraceMark
);

// admin operation
teacherRoute.get("/pendingteacher", protect, adminOnly, getAllPendingTeacher);

teacherRoute.put(
  "/approvependingteacher/:id",
  protect,
  adminOnly,
  approveTeacher
);

teacherRoute.put(
  "/rejectpendingteacher/:id",
  protect,
  adminOnly,
  rejectPendingTeacher
);

teacherRoute.get("/getallteacher", protect, adminOnly, getAllTeacher);
teacherRoute.put("/rejectteacherindashboard/:id", protect, adminOnly,rejectInDashboardTeacher);

export default teacherRoute;

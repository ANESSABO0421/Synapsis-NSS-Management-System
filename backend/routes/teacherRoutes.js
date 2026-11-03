import express from "express";
import { loginSchema, otpSchema, validate } from "../middleware/validate.js";
import {
  assignTeacherToEvent,
  teacherLogin,
  teacherSignUp,
  verifyOtp,
  assignGraceMark,
  generateAttendancePdf,
  approveRecommendedGraceMark,
  rejectPendingTeacher,
  getAllPendingTeacher,
  approveTeacher,
  getAllTeacher,
  rejectInDashboardTeacher,
  // teacherOverview,
  // getTeacherDashboard,
  teacherOverview,
  getPendingRecommendations,
  getMyEvents,
  uploadEventImages,
  editEvent,
  updateGraceMark,
  deleteGraceMark,
  getTeacherProfile,
  updateTeacherProfile,
  getParticipantsOfEvent,
} from "../controllers/teacherController.js";
import upload from "../middleware/uploadMiddleware.js";
import { requireEventAccess } from "../utils/eventAccess.js";
import { markAttendance } from "../controllers/attendanceController.js";
import {
  adminOnly,
  protect,
  teacherOnly,
} from "../middleware/authMiddleware.js";

const teacherRoute = express.Router();

teacherRoute.post(
  "/signup",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "verificationDocument", maxCount: 1 },
  ]),
  teacherSignUp
);
teacherRoute.post("/verify-otp", validate(otpSchema("teacherId")), verifyOtp);
teacherRoute.post("/login", validate(loginSchema), teacherLogin);

// Admin actions
teacherRoute.post("/assign-event", protect, adminOnly, assignTeacherToEvent);

// Attendance
teacherRoute.post(
  "/attendance/:eventId",
  protect,
  teacherOnly,
  requireEventAccess({ param: "eventId", allowTeacher: true }),
  markAttendance
);
teacherRoute.get(
  "/attendance/pdf/:eventId",
  protect,
  teacherOnly,
  generateAttendancePdf
);

// Grace marks
// Teacher must be assigned to the event they grade.
const gradesEvent = (opts) => requireEventAccess({ allowTeacher: true, ...opts });

teacherRoute.post(
  "/grace-marks",
  protect,
  teacherOnly,
  gradesEvent({ param: "eventId", from: "body" }),
  assignGraceMark
);
teacherRoute.put(
  "/update/:studentId/:eventId",
  protect,
  teacherOnly,
  gradesEvent({ param: "eventId" }),
  updateGraceMark
);
teacherRoute.delete(
  "/delete/:studentId/:eventId",
  protect,
  teacherOnly,
  gradesEvent({ param: "eventId" }),
  deleteGraceMark
);


teacherRoute.get(
  "/participantsofevents/:eventId",
  protect,
  teacherOnly,
  getParticipantsOfEvent
);



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
teacherRoute.put(
  "/rejectteacherindashboard/:id",
  protect,
  adminOnly,
  rejectInDashboardTeacher
);

teacherRoute.get("/overview", protect, teacherOnly, teacherOverview);

teacherRoute.get(
  "/pending-recommendations",
  protect,
  teacherOnly,
  getPendingRecommendations
);

teacherRoute.get("/teachermyevents", protect, teacherOnly, getMyEvents);

// Image upload route
teacherRoute.post(
  "/:id/uploadimages",
  protect,
  teacherOnly,
  upload.array("images", 10),
  uploadEventImages
);

teacherRoute.get("/profile", protect, teacherOnly, getTeacherProfile);
teacherRoute.put(
  "/profile",
  protect,
  teacherOnly,
  upload.single("profileImage"),
  updateTeacherProfile
);

// Edit event route
teacherRoute.put("/:id/edit", protect, teacherOnly, editEvent);

export default teacherRoute;

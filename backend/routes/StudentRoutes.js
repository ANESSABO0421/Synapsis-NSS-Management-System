import express from "express";
import { genericOtpSchema, loginSchema, otpSchema, validate } from "../middleware/validate.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  adminCreateStudent,
  approvePendingStudent,
  approveStudent,
  deleteStudent,
  editStudentProfile,
  getAllStudents,
  getFilteredStudentEvents,
  getMyEvents,
  getPendingStudent,
  getStudentAttendanceForEvent,
  getStudentDashboard,
  getStudentEvents,
  getStudentProfile,
  rejectInDashboardStudent,
  rejectStudent,
  removeStudentFromEvent,
  studentLogin,
  studentSignUp,
  studentUpdate,
  uploadEventImages,
  verifyOtp,
} from "../controllers/studentController.js";
import {
  adminOnly,
  authorize,
  protect,
  volunteerOnly,
} from "../middleware/authMiddleware.js";
import { requireEventAccess } from "../utils/eventAccess.js";
import {
  downloadCompletionCertificate,
  downloadEventCertificate,
  getMyProgress,
  listMyCertificates,
} from "../controllers/certificateController.js";

const studentRouter = express.Router();

studentRouter.post(
  "/studentsignup",
  upload.single("profileImage"),
  studentSignUp
);
studentRouter.post("/student-verify-otp", validate(otpSchema("studentId")), verifyOtp);
studentRouter.post("/studentlogin", validate(loginSchema), studentLogin);

// Admin student management (auth runs before multer)
studentRouter.post(
  "/admin-student-create",
  protect,
  adminOnly,
  upload.single("profileImage"),
  adminCreateStudent
);
studentRouter.put("/approve-student/:id", protect, adminOnly, approveStudent);
studentRouter.put(
  "/update-student/:id",
  protect,
  adminOnly,
  upload.single("profileImage"),
  studentUpdate
);
studentRouter.delete("/delete-student/:id", protect, adminOnly, deleteStudent);

// events
studentRouter.get(
  "/student-events/:id",
  protect,
  authorize("admin", "coordinator"),
  getStudentEvents
);
studentRouter.delete(
  "/remove-student-event/:studentId/:eventId",
  protect,
  authorize("admin", "coordinator"),
  requireEventAccess({ param: "eventId" }),
  removeStudentFromEvent
);

//dashboard(admin)
studentRouter.get(
  "/getallpendingstudent",
  protect,
  adminOnly,
  getPendingStudent
);
studentRouter.put(
  "/approvependingstudent/:id",
  protect,
  adminOnly,
  approvePendingStudent
);
studentRouter.put("/rejectstuedent/:id", protect, adminOnly, rejectStudent);

studentRouter.get("/getallstudent", protect, adminOnly, getAllStudents);

studentRouter.put(
  "/rejectinallstudent/:id",
  protect,
  adminOnly,
  rejectInDashboardStudent
);

studentRouter.get("/dashboard", protect, volunteerOnly, getStudentDashboard);

studentRouter.get("/profile", protect, volunteerOnly, getStudentProfile);

studentRouter.put(
  "/profile/edit",
  protect,
  volunteerOnly,
  upload.single("profileImage"),
  editStudentProfile
);

studentRouter.get(
  "/events/filter",
  protect,
  volunteerOnly,
  getFilteredStudentEvents
);

studentRouter.get("/my-events", protect, volunteerOnly, getMyEvents);

// Verifiable participation certificate (replaces the unverifiable AI one).
studentRouter.get("/generate/:eventId", protect, volunteerOnly, downloadEventCertificate);
studentRouter.get("/nss-progress", protect, volunteerOnly, getMyProgress);
studentRouter.get("/certificates", protect, volunteerOnly, listMyCertificates);
studentRouter.get("/nss-certificate", protect, volunteerOnly, downloadCompletionCertificate);

studentRouter.get(
  "/event/:eventId/attendance",
  protect,
  volunteerOnly,
  getStudentAttendanceForEvent
);

studentRouter.post(
  "/:id/uploadimagesbystudent",
  protect,
  volunteerOnly,
  upload.array("images", 10),
  uploadEventImages
);

export default studentRouter;

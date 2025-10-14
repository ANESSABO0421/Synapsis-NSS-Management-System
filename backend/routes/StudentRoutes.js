import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  adminCreateStudent,
  approvePendingStudent,
  approveStudent,
  deleteStudent,
  generateOwnCertificate,
  getPendingStudent,
  getStudentEvents,
  rejectStudent,
  removeStudentFromEvent,
  studentLogin,
  studentSignUp,
  studentUpdate,
  verifyOtp,
} from "../controllers/studentController.js";
import {
  adminOnly,
  protect,
  volunteerOnly,
} from "../middleware/authMiddleware.js";

const studentRouter = express.Router();

studentRouter.post(
  "/studentsignup",
  upload.single("profileImage"),
  studentSignUp
);
studentRouter.post("/student-verify-otp", verifyOtp);
studentRouter.post("/studentlogin", studentLogin);

studentRouter.post(
  "/admin-student-create",
  upload.single("profileImage"),
  adminCreateStudent
);
studentRouter.put("/approve-student/:id", approveStudent);

// profile
studentRouter.put(
  "/update-student/:id",
  upload.single("profileImage"),
  studentUpdate
);
studentRouter.delete("/delete-student/:id", deleteStudent);

// events
studentRouter.get("/student-events/:id", getStudentEvents);
studentRouter.delete(
  "/remove-student-event/:studentId/:eventId",
  removeStudentFromEvent
);

studentRouter.get(
  "/eventcerificate/:eventId",
  protect,
  volunteerOnly,
  generateOwnCertificate
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
studentRouter.delete("/rejectstuedent/:id", protect, adminOnly, rejectStudent);

export default studentRouter;

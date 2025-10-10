import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  adminCreateStudent,
  approveStudent,
  deleteStudent,
  generateOwnCertificate,
  getStudentEvents,
  removeStudentFromEvent,
  studentLogin,
  studentSignUp,
  studentUpdate,
  verifyOtp,
} from "../controllers/studentController.js";
import { protect, volunteerOnly } from "../middleware/authMiddleware.js";

const studentRouter = express.Router();

studentRouter.post(
  "/studentsignup",
  upload.single("profileImage"),
  studentSignUp
);
studentRouter.post("/student-verify-otp", verifyOtp);
studentRouter.post("/studentlogin", studentLogin);

// admin
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

export default studentRouter;

import express from "express";
import {
  approveCoordinator,
  coordinatorSignup,
  createEvent,
  getStudentBySkill,
  Login,
  studentToVolunteer,
  verifyOtp,
  volunteerTostudent,
} from "../controllers/coordinatorController.js";
import upload from "../middleware/uploadMiddleware.js";
import { coordinatorOnly, protect } from "../middleware/authMiddleware.js";

const coordinatorRoute = express.Router();

coordinatorRoute.post(
  "/coordinatorsignup",
  upload.single("profileImage"),
  coordinatorSignup
);
coordinatorRoute.post("/verifyotp", verifyOtp);
coordinatorRoute.post("/approvecoordinator", approveCoordinator);
coordinatorRoute.post("/logincoordinator", Login);
coordinatorRoute.post(
  "/createevents",
  upload.single("images"),
  protect,
  coordinatorOnly,
  createEvent
);
coordinatorRoute.post(
  "/getstudentbyskill/:skills",
  protect,
  coordinatorOnly,
  getStudentBySkill
);

coordinatorRoute.post(
  "/studenttovolunteer",
  protect,
  coordinatorOnly,
  studentToVolunteer
);
coordinatorRoute.post(
  "/volunteertostudent",
  protect,
  coordinatorOnly,
  volunteerTostudent
);

export default coordinatorRoute;

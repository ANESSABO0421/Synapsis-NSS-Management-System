import express from "express";
import { coordinatorSignup } from "../controllers/coordinatorController.js";
import upload from "../middleware/uploadMiddleware.js";

const coordinatorRoute = express.Router();

coordinatorRoute.post(
  "/coordinatorsignup",
  upload.single("profileImage"),
  coordinatorSignup
);

export default coordinatorRoute;

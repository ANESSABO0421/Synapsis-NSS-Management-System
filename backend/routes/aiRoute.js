import express from "express";
import { generateEventSummary } from "../controllers/aiController.js";
import { protect, coordinatorOnly } from "../middleware/authMiddleware.js";

const airouter = express.Router();

airouter.post(
  "/generatesummary",
  protect,
  coordinatorOnly,
  generateEventSummary
);

export default airouter;

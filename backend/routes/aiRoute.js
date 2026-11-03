import express from "express";
import { generateAIInsight, generateEventSummary } from "../controllers/aiController.js";
import { protect, coordinatorOnly, authorize } from "../middleware/authMiddleware.js";

const airouter = express.Router();

airouter.post(
  "/generatesummary",
  protect,
  coordinatorOnly,
  generateEventSummary
);

airouter.post("/generate", protect, authorize("admin", "coordinator", "teacher"), generateAIInsight);

export default airouter;

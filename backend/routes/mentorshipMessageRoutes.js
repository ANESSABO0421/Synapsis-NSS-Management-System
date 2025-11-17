import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMessages,
  sendMessage,
} from "../controllers/mentorshipMessageController.js";

const mentorshipMessage = express.Router();

// GET all messages for a mentorship
mentorshipMessage.get("/:mentorshipId", protect, getMessages);

// SEND new message
mentorshipMessage.post("/:mentorshipId", protect, sendMessage);

export default mentorshipMessage;

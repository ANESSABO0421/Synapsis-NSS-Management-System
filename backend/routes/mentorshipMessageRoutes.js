import express from "express";
import {
  alumniOnly,
  protect,
  volunteerOnly,
} from "../middleware/authMiddleware.js";
import {
  getMessages,
  sendMessage,
} from "../controllers/mentorshipMessageController.js";

const mentorshipMessage = express.Router();

// GET all messages for a mentorship
mentorshipMessage.get("/:mentorshipId", protect, getMessages);



mentorshipMessage.get("/studentchat/:mentorshipId", protect, volunteerOnly, getMessages);
mentorshipMessage.get("/alumnichat/:mentorshipId", protect, alumniOnly, getMessages);

// SEND new message
mentorshipMessage.post(
  "/studentchat/:mentorshipId",
  protect,
  volunteerOnly,
  sendMessage
);
mentorshipMessage.post(
  "/alumnichat/:mentorshipId",
  protect,
  alumniOnly,
  sendMessage
);

export default mentorshipMessage;

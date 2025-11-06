import express from "express";
import { getMessagesForEvent } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const messagerouter = express.Router();
messagerouter.get("/events/:eventId/messages", protect, getMessagesForEvent);
export default messagerouter;

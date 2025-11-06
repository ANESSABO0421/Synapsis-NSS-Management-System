import express from "express";
import { getMessagesForEvent, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const messagerouter = express.Router();
messagerouter.get("/events/:eventId/messages",  getMessagesForEvent);
messagerouter.post("/send",protect, sendMessage);
export default messagerouter;

import mongoose from "mongoose";
import Message from "../models/Message.js";
import Event from "../models/Event.js";
import { eventRoom, isEventMember } from "../utils/eventAccess.js";

const MAX_MESSAGE_LENGTH = 2000;

const loadEventForMember = async (req, res, eventId) => {
  if (!mongoose.isValidObjectId(eventId)) {
    res.status(400).json({ success: false, message: "Invalid event id" });
    return null;
  }
  const event = await Event.findById(eventId).select(
    "institution assignedCoordinators assignedTeacher participants"
  );
  if (!event) {
    res.status(404).json({ success: false, message: "Event not found." });
    return null;
  }
  if (!isEventMember(req.user, event)) {
    res.status(403).json({ success: false, message: "You are not a member of this event chat" });
    return null;
  }
  return event;
};

export const getMessagesForEvent = async (req, res, next) => {
  try {
    const event = await loadEventForMember(req, res, req.params.eventId);
    if (!event) return;

    // Latest 200, returned oldest-first.
    const messages = await Message.find({ eventId: event._id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    messages.reverse();

    return res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!eventId || !content) {
      return res
        .status(400)
        .json({ success: false, message: "eventId and content are required." });
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message must be under ${MAX_MESSAGE_LENGTH} characters`,
      });
    }

    const event = await loadEventForMember(req, res, eventId);
    if (!event) return;

    const message = await Message.create({
      eventId: event._id,
      institutionId: event.institution,
      sender: { id: req.user._id, name: req.user.name, role: req.user.role },
      content,
    });

    const payload = message.toJSON();
    // Broadcast to everyone in the room; clients de-duplicate by _id.
    req.app.get("io")?.to(eventRoom(event._id)).emit("receive_message", payload);

    res.status(201).json({ success: true, message: payload });
  } catch (error) {
    next(error);
  }
};

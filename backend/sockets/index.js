// @ts-check
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Mentorship from "../models/Mentorship.js";
import MentorshipMessage from "../models/MentorshipMessage.js";
import { socketAuth } from "./socketAuth.js";
import { eventRoom, isEventMember } from "../utils/eventAccess.js";
import { logger } from "../utils/logger.js";
import { captureException } from "../configs/sentry.js";

const MAX_MESSAGE_LENGTH = 2000;

// Wrap handlers so a thrown error never becomes an unhandled rejection.
const safe = (socket, handler) => async (...args) => {
  try {
    await handler(...args);
  } catch (err) {
    logger.error({ err, socketId: socket.id, user: socket.user?.id }, "Socket handler error");
    captureException(err);
    socket.emit("error_message", "Something went wrong");
  }
};

/**
 * Event group chat (default namespace).
 * Messages are persisted ONLY via REST (POST /api/chat/:role/send), which then
 * broadcasts `receive_message` to the room. Sockets here just join/leave/typing.
 */
const registerEventChat = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const joined = new Set();

    socket.on(
      "join_event",
      safe(socket, async (eventId) => {
        if (!mongoose.isValidObjectId(eventId)) return;
        const event = await Event.findById(eventId).select(
          "assignedCoordinators assignedTeacher participants"
        );
        if (!event || !isEventMember(socket.user, event)) {
          socket.emit("error_message", "You are not a member of this event chat");
          return;
        }
        socket.join(eventRoom(eventId));
        joined.add(String(eventId));
      })
    );

    socket.on("leave_event", (eventId) => {
      socket.leave(eventRoom(eventId));
      joined.delete(String(eventId));
    });

    socket.on("typing", (/** @type {{ eventId?: string }} */ { eventId } = {}) => {
      if (!joined.has(String(eventId))) return;
      socket.to(eventRoom(eventId)).emit("user_typing", {
        eventId,
        name: socket.user.name,
      });
    });
  });
};

/** Private alumni <-> student mentorship chat. */
const registerMentorshipChat = (io) => {
  const nsp = io.of("/mentorship-chat");
  nsp.use(socketAuth);

  // Only the mentor or mentee of an *active* mentorship may participate.
  const findAccessible = (socket, mentorshipId) => {
    if (!mongoose.isValidObjectId(mentorshipId)) return null;
    const { id, role } = socket.user;
    const side = role === "alumni" ? { mentor: id } : { mentee: id };
    return Mentorship.findOne({ _id: mentorshipId, status: "active", ...side }).select("_id");
  };

  nsp.on("connection", (socket) => {
    const joined = new Set();

    socket.on(
      "joinMentorship",
      safe(socket, async (/** @type {{ mentorshipId?: string }} */ { mentorshipId } = {}) => {
        const mentorship = await findAccessible(socket, mentorshipId);
        if (!mentorship) {
          socket.emit("error_message", "You do not have access to this mentorship");
          return;
        }
        socket.join(String(mentorshipId));
        joined.add(String(mentorshipId));
      })
    );

    socket.on(
      "sendMentorMessage",
      safe(socket, async (/** @type {{ mentorshipId?: string, message?: string }} */ { mentorshipId, message } = {}) => {
        if (!joined.has(String(mentorshipId))) return;
        const text = typeof message === "string" ? message.trim() : "";
        if (!text || text.length > MAX_MESSAGE_LENGTH) return;

        const saved = await MentorshipMessage.create({
          mentorship: mentorshipId,
          senderId: socket.user.id,
          senderRole: socket.user.role === "alumni" ? "alumni" : "student",
          message: text,
        });
        nsp.to(String(mentorshipId)).emit("newMentorMessage", saved.toJSON());
      })
    );

    for (const evt of ["typing", "stopTyping"]) {
      socket.on(evt, (/** @type {{ mentorshipId?: string }} */ { mentorshipId } = {}) => {
        if (joined.has(String(mentorshipId))) {
          socket.to(String(mentorshipId)).emit(evt);
        }
      });
    }
  });
};

export const registerSockets = (io) => {
  registerEventChat(io);
  registerMentorshipChat(io);
};

// @ts-check
import mongoose from "mongoose";
import Event from "../models/Event.js";

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

/**
 * Can the authenticated user manage this event?
 *  - admin / superadmin: always
 *  - coordinator: if they are the event's assigned coordinator
 *  - teacher: if `allowTeacher` and they are one of the assigned teachers
 */
export const canManageEvent = (user, event, { allowTeacher = false } = {}) => {
  switch (user?.role) {
    case "admin":
    case "superadmin":
      return true;
    case "coordinator":
      return sameId(event.assignedCoordinators, user._id);
    case "teacher":
      return allowTeacher && (event.assignedTeacher || []).some((t) => sameId(t, user._id));
    default:
      return false;
  }
};

/**
 * Route middleware: loads the event from req.params[param] (or req.body[param]
 * with from: "body"), checks access,
 * and exposes it as req.event. Responds 400/404/403 itself.
 */
export const requireEventAccess =
  ({ param = "id", from = "params", allowTeacher = false } = {}) =>
  async (req, res, next) => {
    try {
      const id = (from === "body" ? req.body : req.params)?.[param];
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid event id" });
      }
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      if (!canManageEvent(req.user, event, { allowTeacher })) {
        return res
          .status(403)
          .json({ success: false, message: "You do not manage this event" });
      }
      req.event = event;
      next();
    } catch (error) {
      next(error);
    }
  };

/**
 * Event chat membership: admins, the event's coordinator, its assigned
 * teachers, and its participating students. `user` needs { _id|id, role }.
 */
export const isEventMember = (user, event) => {
  const uid = user?._id ?? user?.id;
  switch (user?.role) {
    case "admin":
    case "superadmin":
      return true;
    case "coordinator":
      return sameId(event.assignedCoordinators, uid);
    case "teacher":
      return (event.assignedTeacher || []).some((t) => sameId(t, uid));
    case "student":
    case "volunteer":
      return (event.participants || []).some((p) => sameId(p, uid));
    default:
      return false;
  }
};

export const eventRoom = (eventId) => `event:${eventId}`;

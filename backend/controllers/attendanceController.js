import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import Event from "../models/Event.js";
import { config } from "../configs/env.js";

export const QR_TTL_SECONDS = 45;
// Minimum time between check-in and check-out, so a double scan isn't a check-out.
export const MIN_CHECKOUT_MINUTES = 5;

// Separate signing key so a QR token can never be used as a login token (and vice versa).
const qrSecret = () => `${process.env.JWT_SECRET}:attendance-qr`;

const liveStats = (event) => {
  const participants = event.participants.length;
  let checkedIn = 0;
  let checkedOut = 0;
  for (const a of event.attendance) {
    if (a.checkInAt) checkedIn += 1;
    if (a.checkOutAt) checkedOut += 1;
  }
  return { participants, checkedIn, checkedOut, onSite: checkedIn - checkedOut };
};

/**
 * GET /api/events/:id/qr — coordinator/assigned teacher. Returns a short-lived
 * token to render as a QR code; the display refreshes it before it expires,
 * so a forwarded screenshot is useless within a minute.
 */
export const getQrToken = async (req, res) => {
  const event = req.event;
  if (event.status !== "Ongoing") {
    return res
      .status(400)
      .json({ success: false, message: "Start the event before opening QR attendance" });
  }
  const token = jwt.sign(
    { e: String(event._id), n: crypto.randomBytes(6).toString("hex") },
    qrSecret(),
    { expiresIn: QR_TTL_SECONDS }
  );
  res.json({
    success: true,
    token,
    expiresIn: QR_TTL_SECONDS,
    url: `${config.frontendUrl}/checkin?t=${encodeURIComponent(token)}`,
    stats: liveStats(event),
  });
};

/**
 * POST /api/events/checkin { token } — the scanning student.
 * First scan checks in; a later scan (after MIN_CHECKOUT_MINUTES) checks out.
 */
export const qrCheckIn = async (req, res, next) => {
  try {
    let payload;
    try {
      payload = jwt.verify(String(req.body.token || ""), qrSecret());
    } catch (err) {
      const expired = err.name === "TokenExpiredError";
      return res.status(400).json({
        success: false,
        code: expired ? "expired" : "invalid",
        message: expired
          ? "This QR code has expired. Scan the code currently on screen."
          : "Invalid QR code.",
      });
    }

    const event = await Event.findById(payload.e);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.status !== "Ongoing") {
      return res.status(400).json({ success: false, message: "This event is not running right now" });
    }

    const studentId = String(req.user._id);
    if (!event.participants.some((p) => String(p) === studentId)) {
      return res
        .status(403)
        .json({ success: false, message: "You are not registered for this event" });
    }

    const now = new Date();
    let record = event.attendance.find((a) => String(a.student) === studentId);
    let action;

    if (!record || !record.checkInAt) {
      if (!record) {
        event.attendance.push({ student: req.user._id });
        record = event.attendance.at(-1);
      }
      Object.assign(record, { status: "Present", method: "qr", checkInAt: now, markedAt: now });
      action = "checked_in";
    } else if (record.checkOutAt) {
      return res
        .status(409)
        .json({ success: false, code: "done", message: "You have already checked out of this event" });
    } else {
      const minutes = (now - record.checkInAt) / 60_000;
      if (minutes < MIN_CHECKOUT_MINUTES) {
        return res.status(409).json({
          success: false,
          code: "too_soon",
          message: `You're checked in. Scan again when you leave (after ${MIN_CHECKOUT_MINUTES} minutes).`,
        });
      }
      record.checkOutAt = now;
      action = "checked_out";
    }

    await event.save();
    req.app.get("io")?.to(`event:${event._id}`).emit("attendance_update", liveStats(event));

    res.json({
      success: true,
      action,
      event: { _id: event._id, title: event.title },
      checkInAt: record.checkInAt,
      checkOutAt: record.checkOutAt || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/teacher/attendance/:eventId — manual marking by the event's
 * teacher/coordinator. Only participants can be marked; QR times are kept.
 */
export const markAttendance = async (req, res, next) => {
  try {
    const event = req.event;
    const list = Array.isArray(req.body.attendanceList) ? req.body.attendanceList : [];
    const participants = new Set(event.participants.map(String));
    const skipped = [];

    for (const item of list) {
      const studentId = String(item?.studentId || "");
      if (!participants.has(studentId) || !["Present", "Absent"].includes(item.status)) {
        skipped.push(studentId);
        continue;
      }
      const record = event.attendance.find((a) => String(a.student) === studentId);
      if (record) {
        record.status = item.status;
        record.markedAt = new Date();
        record.markedBy = req.user._id;
      } else {
        event.attendance.push({ student: studentId, status: item.status, markedBy: req.user._id, markedAt: new Date() });
      }
    }

    await event.save();
    res.json({
      success: true,
      message: skipped.length
        ? `Attendance updated (${skipped.length} invalid entr${skipped.length === 1 ? "y" : "ies"} skipped)`
        : "Attendance updated",
      attendance: event.attendance,
      skipped,
    });
  } catch (error) {
    next(error);
  }
};

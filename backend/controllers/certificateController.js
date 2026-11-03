import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import Coordinator from "../models/Coordinator.js";
import Event from "../models/Event.js";
import Student from "../models/Student.js";
import { creditedHours, progressForInstitution, progressForStudent } from "../services/nssProgress.js";
import {
  defaultCompletionText,
  defaultEventText,
  issueCertificate,
  publicView,
  streamCertificatePdf,
  verifyUrl,
} from "../services/certificates.js";

const CODE_RE = /^[A-Z2-9]{10}$/;

// GET /api/students/nss-progress
export const getMyProgress = async (req, res, next) => {
  try {
    res.json({ success: true, progress: await progressForStudent(req.user._id) });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/certificates — certificates already issued to me
export const listMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ student: req.user._id }).sort({ issuedAt: -1 }).lean();
    res.json({
      success: true,
      certificates: certs.map((c) => ({ ...publicView(c), eventId: c.event, verifyUrl: verifyUrl(c.code) })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/generate/:eventId — participation certificate PDF
export const downloadEventCertificate = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.status !== "Completed") {
      return res
        .status(400)
        .json({ success: false, message: "Certificate available only after event completion" });
    }

    const att = event.attendance.find((a) => String(a.student) === String(req.user._id));
    if (!att || att.status !== "Present") {
      return res.status(403).json({
        success: false,
        message: "Certificates are issued only to volunteers marked present at the event",
      });
    }

    const student = await Student.findById(req.user._id);
    const cert = await issueCertificate({
      type: "event",
      student,
      event,
      hours: creditedHours(event, att),
    });
    if (cert.revoked) {
      return res.status(410).json({ success: false, message: "This certificate has been revoked" });
    }
    await streamCertificatePdf(res, cert, defaultEventText(cert.snapshot));
  } catch (error) {
    next(error);
  }
};

// GET /api/students/nss-certificate — completion certificate (240h + special camp)
export const downloadCompletionCertificate = async (req, res, next) => {
  try {
    const progress = await progressForStudent(req.user._id);
    if (!progress.eligible) {
      return res.status(403).json({
        success: false,
        message: `Not yet eligible: ${progress.remainingHours} hours remaining${
          progress.specialCampDone ? "" : " and the special camp is pending"
        }.`,
        progress,
      });
    }
    const student = await Student.findById(req.user._id);
    const cert = await issueCertificate({
      type: "nss_completion",
      student,
      hours: progress.totalHours,
    });
    if (cert.revoked) {
      return res.status(410).json({ success: false, message: "This certificate has been revoked" });
    }
    await streamCertificatePdf(res, cert, defaultCompletionText(cert.snapshot));
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates/verify/:code — PUBLIC
export const verifyCertificate = async (req, res, next) => {
  try {
    const code = String(req.params.code || "").toUpperCase();
    if (!CODE_RE.test(code)) {
      return res.status(404).json({ success: false, valid: false, message: "Certificate not found" });
    }
    const cert = await Certificate.findOne({ code }).lean();
    if (!cert) {
      return res.status(404).json({ success: false, valid: false, message: "Certificate not found" });
    }
    res.json({ success: true, certificate: publicView(cert) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/certificates/:code/revoke { reason } — admin, or coordinator of the same institution
export const revokeCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ code: String(req.params.code).toUpperCase() });
    if (!cert) return res.status(404).json({ success: false, message: "Certificate not found" });

    if (req.user.role === "coordinator" && String(cert.institution) !== String(req.user.institution)) {
      return res.status(403).json({ success: false, message: "Not your institution's certificate" });
    }
    cert.revoked = true;
    cert.revokedReason = String(req.body.reason || "").slice(0, 300);
    await cert.save();
    res.json({ success: true, certificate: publicView(cert) });
  } catch (error) {
    next(error);
  }
};

// GET /api/coordinator/nss-progress — every volunteer in my institution
export const getVolunteerProgress = async (req, res, next) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id).select("institution");
    const students = await Student.find({ institution: coordinator.institution, role: "volunteer", status: "active" })
      .select("name email department")
      .sort({ name: 1 })
      .lean();
    const rows = await progressForInstitution(coordinator.institution, students);
    const counts = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
    res.json({ success: true, counts, volunteers: rows });
  } catch (error) {
    next(error);
  }
};

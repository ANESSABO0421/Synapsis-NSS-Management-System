import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import Certificate from "../models/Certificate.js";
import Institution from "../models/Institution.js";
import { config } from "../configs/env.js";

// Unambiguous alphabet (no 0/O/1/I), 10 chars ≈ 50 bits: unguessable, easy to type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newCode = () =>
  Array.from(crypto.randomBytes(10), (b) => ALPHABET[b % ALPHABET.length]).join("");

export const verifyUrl = (code) => `${config.frontendUrl}/verify/${code}`;

/** Find or create the certificate record (idempotent). */
export const issueCertificate = async ({ type, student, event, hours }) => {
  const filter = { type, student: student._id, ...(type === "event" ? { event: event._id } : {}) };
  const existing = await Certificate.findOne(filter);
  if (existing) return existing;

  const institution = await Institution.findById(student.institution).select("name").lean();
  const doc = {
    ...filter,
    institution: student.institution,
    snapshot: {
      studentName: student.name,
      department: student.department,
      institutionName: institution?.name || "",
      eventTitle: event?.title,
      eventDate: event?.date,
      hours,
    },
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await Certificate.create({ ...doc, code: newCode() });
    } catch (err) {
      if (err.code !== 11000) throw err;
      // Lost a race with a concurrent request for the same certificate.
      const raced = await Certificate.findOne(filter);
      if (raced) return raced;
    }
  }
  throw new Error("Could not allocate certificate code");
};

/** Public view of a certificate for the verification page. */
export const publicView = (cert) => ({
  code: cert.code,
  type: cert.type,
  valid: !cert.revoked,
  revoked: cert.revoked,
  revokedReason: cert.revoked ? cert.revokedReason || "" : undefined,
  issuedAt: cert.issuedAt,
  ...cert.snapshot,
});

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

/** Stream a certificate PDF (A4 landscape) with a verification QR code. */
export const streamCertificatePdf = async (res, cert, bodyText) => {
  const s = cert.snapshot;
  const qr = await QRCode.toBuffer(verifyUrl(cert.code), { margin: 1, width: 220 });

  const W = 842;
  const H = 595;
  const navy = "#0B3D91";
  const gold = "#C8A600";
  const doc = new PDFDocument({ size: [W, H], margin: 0, info: { Title: `NSS Certificate ${cert.code}` } });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="NSS_Certificate_${cert.code}.pdf"`);
  doc.pipe(res);

  doc.rect(0, 0, W, H).fill("#FFFFFF");
  doc.lineWidth(10).strokeColor(navy).rect(25, 25, W - 50, H - 50).stroke();
  doc.lineWidth(3).strokeColor(gold).rect(40, 40, W - 80, H - 80).stroke();

  doc.font("Helvetica-Bold").fontSize(26).fillColor(navy)
    .text("National Service Scheme (NSS)", 0, 70, { align: "center" });
  doc.font("Helvetica").fontSize(13).fillColor("#555")
    .text(s.institutionName || "", 0, 106, { align: "center" });

  const title = cert.type === "nss_completion" ? "Certificate of Completion" : "Certificate of Participation";
  doc.font("Times-BoldItalic").fontSize(34).fillColor(gold).text(title, 0, 145, { align: "center" });

  doc.font("Times-Roman").fontSize(15).fillColor("#333").text("This is to certify that", 0, 205, { align: "center" });
  doc.font("Times-BoldItalic").fontSize(26).fillColor(navy).text(s.studentName, 0, 230, { align: "center" });
  doc.font("Times-Italic").fontSize(14).fillColor("#555")
    .text(`Department of ${s.department}`, 0, 265, { align: "center" });

  const textWidth = W - 240;
  doc.font("Times-Roman").fontSize(15).fillColor("#1C1C1C")
    .text(bodyText, (W - textWidth) / 2, 298, { width: textWidth, align: "center", lineGap: 5, height: 80, ellipsis: true });

  doc.font("Helvetica").fontSize(12).fillColor("#1C1C1C")
    .text("_______________________", 110, 440)
    .font("Helvetica-Bold").text("Programme Officer", 130, 458);
  doc.font("Helvetica").fontSize(12)
    .text("_______________________", 360, 440)
    .font("Helvetica-Bold").text("Principal", 405, 458);

  // Verification block (bottom-right)
  doc.image(qr, W - 190, 400, { width: 110 });
  doc.font("Helvetica").fontSize(8).fillColor("#555")
    .text("Scan to verify", W - 190, 512, { width: 110, align: "center" })
    .text(cert.code, W - 190, 523, { width: 110, align: "center" });

  doc.font("Helvetica-Oblique").fontSize(10).fillColor("#777")
    .text(`Issued ${fmtDate(cert.issuedAt)} · Verify at ${verifyUrl(cert.code)}`, 60, 540, { width: W - 280 });

  doc.end();
};

export const defaultEventText = (s) =>
  `has actively participated in "${s.eventTitle}" held on ${fmtDate(s.eventDate)}` +
  (s.hours ? `, contributing ${s.hours} hours of community service` : "") +
  `, reflecting the spirit of "Not Me, But You".`;

export const defaultCompletionText = (s) =>
  `has successfully completed ${s.hours} hours of service, including the special camp, ` +
  `fulfilling the requirements of the National Service Scheme.`;

import PDFDocument from "pdfkit";
import Donation from "../models/Donation.js";
import Event from "../models/Event.js";
import Institution from "../models/Institution.js";
import Student from "../models/Student.js";
import { NSS_RULES, academicYearOf, academicYearRange } from "../configs/nss.js";
import { collectEntries, creditedHours } from "./nssProgress.js";
import { groq } from "../utils/ai.js";

const round2 = (n) => Math.round(n * 100) / 100;

export const buildAnnualReport = async (institutionId, year = academicYearOf(new Date())) => {
  const range = academicYearRange(year);
  if (!range) {
    const err = new Error('Invalid academic year, expected e.g. "2025-26"');
    err.status = 400;
    throw err;
  }
  const [from, to] = range;

  const [institution, events] = await Promise.all([
    Institution.findById(institutionId).select("name address").lean(),
    Event.find({ institution: institutionId, date: { $gte: from, $lt: to } })
      .select("title date location category status participants attendance hours calculatedHours startTime endTime totalCollected")
      .sort({ date: 1 })
      .lean(),
  ]);

  const donations = await Donation.aggregate([
    { $match: { eventId: { $in: events.map((e) => e._id) } } },
    { $group: { _id: "$eventId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const donationsByEvent = new Map(donations.map((d) => [String(d._id), d]));

  const rows = events.map((e) => {
    const present = (e.attendance || []).filter((a) => a.status === "Present");
    const hours =
      e.status === "Completed" ? round2(present.reduce((s, a) => s + creditedHours(e, a), 0)) : 0;
    const d = donationsByEvent.get(String(e._id));
    return {
      id: String(e._id),
      title: e.title,
      date: e.date,
      location: e.location,
      category: e.category || "regular",
      status: e.status,
      registered: (e.participants || []).length,
      present: present.length,
      volunteerHours: hours,
      donations: d?.total || 0,
      donationCount: d?.count || 0,
    };
  });

  const completed = rows.filter((r) => r.status === "Completed");
  const byStudent = collectEntries(events);
  const hoursByStudent = [...byStudent.entries()].map(([id, entries]) => ({
    id,
    hours: round2(entries.reduce((s, e) => s + e.hours, 0)),
    events: entries.length,
  }));
  hoursByStudent.sort((a, b) => b.hours - a.hours);

  const topIds = hoursByStudent.slice(0, 10).map((h) => h.id);
  const names = new Map(
    (await Student.find({ _id: { $in: topIds } }).select("name department").lean()).map((s) => [String(s._id), s])
  );

  const registeredCompleted = completed.reduce((s, r) => s + r.registered, 0);
  const presentCompleted = completed.reduce((s, r) => s + r.present, 0);

  const totals = {
    events: rows.length,
    byStatus: rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {}),
    specialCamps: rows.filter((r) => r.category === "special_camp").length,
    activeVolunteers: hoursByStudent.length,
    volunteerHours: round2(hoursByStudent.reduce((s, h) => s + h.hours, 0)),
    volunteersMeetingYearlyTarget: hoursByStudent.filter((h) => h.hours >= NSS_RULES.hoursPerYear).length,
    attendanceRate: registeredCompleted ? Math.round((presentCompleted / registeredCompleted) * 100) : null,
    donations: rows.reduce((s, r) => s + r.donations, 0),
    donationCount: rows.reduce((s, r) => s + r.donationCount, 0),
  };

  return {
    institution: { id: String(institutionId), name: institution?.name || "", address: institution?.address || "" },
    academicYear: year,
    period: { from, to: new Date(to - 1) },
    generatedAt: new Date(),
    rules: NSS_RULES,
    totals,
    events: rows,
    topVolunteers: hoursByStudent.slice(0, 10).map((h) => ({
      ...h,
      name: names.get(h.id)?.name || "Unknown",
      department: names.get(h.id)?.department || "",
    })),
  };
};

/** Short narrative for the report. Returns null if AI is not configured / fails. */
export const aiSummary = async (report) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 400,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You write concise, factual annual-report summaries for a college NSS unit. Use only the numbers given. 2 short paragraphs, no headings, no markdown.",
        },
        {
          role: "user",
          content: JSON.stringify({
            institution: report.institution.name,
            academicYear: report.academicYear,
            totals: report.totals,
            events: report.events.map(({ title, category, status, present, volunteerHours }) => ({
              title, category, status, present, volunteerHours,
            })),
          }),
        },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    if (err.status !== 503) console.error("AI report summary failed:", err.message);
    return null;
  }
};

// ---------- CSV ----------
// Leading = + - @ would be executed as formulas by Excel (CSV injection).
const cell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const line = (arr) => arr.map(cell).join(",");
const iso = (d) => new Date(d).toISOString().slice(0, 10);

export const reportToCsv = (r) =>
  [
    line([`NSS Annual Report ${r.academicYear}`, r.institution.name]),
    line(["Events", r.totals.events]),
    line(["Volunteer hours", r.totals.volunteerHours]),
    line(["Active volunteers", r.totals.activeVolunteers]),
    line([`Volunteers with ${r.rules.hoursPerYear}+ hours`, r.totals.volunteersMeetingYearlyTarget]),
    line(["Attendance rate (%)", r.totals.attendanceRate ?? ""]),
    line(["Donations (INR)", r.totals.donations]),
    "",
    line(["Date", "Event", "Category", "Status", "Location", "Registered", "Present", "Volunteer hours", "Donations (INR)"]),
    ...r.events.map((e) =>
      line([iso(e.date), e.title, e.category, e.status, e.location, e.registered, e.present, e.volunteerHours, e.donations])
    ),
    "",
    line(["Top volunteers", "Department", "Hours", "Events"]),
    ...r.topVolunteers.map((v) => line([v.name, v.department, v.hours, v.events])),
  ].join("\n");

// ---------- PDF ----------
export const streamReportPdf = (res, r, summary) => {
  const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: `NSS Annual Report ${r.academicYear}` } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="NSS_Annual_Report_${r.academicYear}.pdf"`);
  doc.pipe(res);

  const navy = "#0B3D91";
  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  doc.font("Helvetica-Bold").fontSize(20).fillColor(navy).text("National Service Scheme", { align: "center" });
  doc.fontSize(14).fillColor("#222").text(`Annual Report ${r.academicYear}`, { align: "center" });
  doc.font("Helvetica").fontSize(11).fillColor("#555").text(r.institution.name, { align: "center" });
  doc.moveDown(1.5);

  const kv = [
    ["Events conducted", r.totals.events],
    ["Completed", r.totals.byStatus.Completed || 0],
    ["Special camps", r.totals.specialCamps],
    ["Active volunteers", r.totals.activeVolunteers],
    ["Total volunteer hours", r.totals.volunteerHours],
    [`Volunteers with ${r.rules.hoursPerYear}+ hours`, r.totals.volunteersMeetingYearlyTarget],
    ["Attendance rate", r.totals.attendanceRate == null ? "-" : `${r.totals.attendanceRate}%`],
    ["Donations received", `INR ${r.totals.donations.toLocaleString("en-IN")} (${r.totals.donationCount})`],
  ];
  doc.font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Summary");
  doc.moveDown(0.4);
  for (const [k, v] of kv) {
    const y = doc.y;
    doc.font("Helvetica").fontSize(10.5).fillColor("#333").text(k, 50, y, { width: 260 });
    doc.font("Helvetica-Bold").text(String(v), 320, y, { width: 220 });
    doc.moveDown(0.2);
  }

  if (summary) {
    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Overview", 50);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10.5).fillColor("#222").text(summary, 50, doc.y, { width: 495, lineGap: 3 });
  }

  // Events table
  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Events", 50);
  doc.moveDown(0.4);
  const cols = [
    ["Date", 50, 65], ["Event", 115, 190], ["Type", 305, 55], ["Status", 360, 60],
    ["Present", 420, 45], ["Hours", 465, 40], ["INR", 505, 45],
  ];
  const header = () => {
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#333");
    for (const [label, x, w] of cols) doc.text(label, x, y, { width: w });
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor("#ccc").stroke();
    doc.moveDown(0.4);
  };
  header();
  doc.font("Helvetica").fontSize(9).fillColor("#222");
  for (const e of r.events) {
    if (doc.y > 760) {
      doc.addPage();
      header();
      doc.font("Helvetica").fontSize(9).fillColor("#222");
    }
    const y = doc.y;
    const values = [
      fmt(e.date), e.title, e.category === "special_camp" ? "Camp" : "Regular", e.status,
      `${e.present}/${e.registered}`, e.volunteerHours, e.donations || "-",
    ];
    let bottom = y;
    cols.forEach(([, x, w], i) => {
      doc.text(String(values[i]), x, y, { width: w });
      bottom = Math.max(bottom, doc.y);
    });
    doc.y = bottom + 3;
  }
  if (!r.events.length) doc.text("No events in this academic year.", 50);

  if (r.topVolunteers.length) {
    if (doc.y > 650) doc.addPage();
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Top volunteers", 50);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(10).fillColor("#222");
    r.topVolunteers.forEach((v, i) => {
      doc.text(`${i + 1}. ${v.name}${v.department ? ` (${v.department})` : ""} - ${v.hours} h across ${v.events} event${v.events === 1 ? "" : "s"}`, 50);
    });
  }

  doc.moveDown(2);
  doc.font("Helvetica-Oblique").fontSize(8).fillColor("#888")
    .text(`Generated ${fmt(r.generatedAt)} by the Synapsis NSS Management System`, 50, doc.y, { align: "center", width: 495 });
  doc.end();
};

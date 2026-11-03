import Event from "../models/Event.js";
import { NSS_RULES, academicYearElapsed, academicYearOf } from "../configs/nss.js";

const round2 = (n) => Math.round(n * 100) / 100;
const HOUR = 3_600_000;

/** Duration of an event in hours (actual if it ran, otherwise planned). */
export const eventDurationHours = (event) => {
  if (event.calculatedHours > 0) return Number(event.calculatedHours);
  if (event.startTime && event.endTime) return round2((event.endTime - event.startTime) / HOUR);
  return Number(event.hours) || 0;
};

/**
 * Hours a single attendance record earns.
 *  - Absent: 0
 *  - QR check-in: time actually present, clipped to the event window
 *    (no check-out = until the event ended)
 *  - Manual "Present": the full event duration
 */
export const hoursForAttendance = (event, att) => {
  if (att.status !== "Present") return 0;
  const duration = eventDurationHours(event);
  if (!att.checkInAt) return duration;

  const start = Math.max(new Date(att.checkInAt), event.startTime ? new Date(event.startTime) : 0);
  const endCandidates = [att.checkOutAt, event.endTime].filter(Boolean).map((d) => new Date(d));
  const end = endCandidates.length ? Math.min(...endCandidates) : Date.now();
  return round2(Math.min(duration, Math.max(0, (end - start) / HOUR)));
};

/** Credited hours for a record on a completed event (stored value wins). */
export const creditedHours = (event, att) =>
  att.hours != null ? Number(att.hours) : hoursForAttendance(event, att);

/**
 * Per-student ledger of completed, attended events.
 * @returns Map<studentId, Array<{eventId,title,date,category,hours,academicYear}>>
 */
export const collectEntries = (events, studentFilter) => {
  const byStudent = new Map();
  for (const event of events) {
    if (event.status !== "Completed") continue;
    for (const att of event.attendance || []) {
      const sid = String(att.student);
      if (studentFilter && !studentFilter.has(sid)) continue;
      if (att.status !== "Present") continue;
      const entry = {
        eventId: String(event._id),
        title: event.title,
        date: event.date,
        category: event.category || "regular",
        hours: creditedHours(event, att),
        academicYear: academicYearOf(event.date),
      };
      if (!byStudent.has(sid)) byStudent.set(sid, []);
      byStudent.get(sid).push(entry);
    }
  }
  return byStudent;
};

/** Summarise a student's entries against the NSS rules. */
export const summarize = (entries = [], now = new Date()) => {
  const currentYear = academicYearOf(now);
  const byYear = {};
  for (const e of entries) byYear[e.academicYear] = round2((byYear[e.academicYear] || 0) + e.hours);

  const totalHours = round2(entries.reduce((s, e) => s + e.hours, 0));
  const specialCampDone = entries.some((e) => e.category === "special_camp");
  const yearsCompleted = Object.values(byYear).filter((h) => h >= NSS_RULES.hoursPerYear).length;
  const eligible =
    totalHours >= NSS_RULES.totalHours && (!NSS_RULES.specialCampRequired || specialCampDone);

  const currentYearHours = byYear[currentYear] || 0;
  const expectedByNow = NSS_RULES.hoursPerYear * academicYearElapsed(currentYear, now);
  let status = "on_track";
  if (eligible) status = "completed";
  else if (currentYearHours < expectedByNow * 0.75) status = "behind";

  return {
    rules: NSS_RULES,
    totalHours,
    currentYear,
    currentYearHours,
    hoursByYear: Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, hours]) => ({ year, hours, metTarget: hours >= NSS_RULES.hoursPerYear })),
    yearsCompleted,
    specialCampDone,
    eligible,
    status,
    remainingHours: round2(Math.max(0, NSS_RULES.totalHours - totalHours)),
    percent: Math.min(100, Math.round((totalHours / NSS_RULES.totalHours) * 100)),
    events: [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
};

const PROGRESS_FIELDS = "title date category status hours calculatedHours startTime endTime attendance";

export const progressForStudent = async (studentId) => {
  const events = await Event.find({ status: "Completed", "attendance.student": studentId })
    .select(PROGRESS_FIELDS)
    .lean();
  const entries = collectEntries(events, new Set([String(studentId)])).get(String(studentId));
  return summarize(entries);
};

export const progressForInstitution = async (institutionId, students) => {
  const events = await Event.find({ institution: institutionId, status: "Completed" })
    .select(PROGRESS_FIELDS)
    .lean();
  const ids = new Set(students.map((s) => String(s._id)));
  const byStudent = collectEntries(events, ids);
  return students.map((s) => {
    const { events: _events, rules: _rules, ...summary } = summarize(byStudent.get(String(s._id)));
    return { student: { _id: s._id, name: s.name, email: s.email, department: s.department }, ...summary };
  });
};

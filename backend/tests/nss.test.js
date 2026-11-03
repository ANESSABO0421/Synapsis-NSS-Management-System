import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import { bearer, clearDb, seed, startDb, stopDb } from "./helpers.js";

const { default: app } = await import("../app.js");
const { default: Event } = await import("../models/Event.js");
const { default: Student } = await import("../models/Student.js");
const { default: Certificate } = await import("../models/Certificate.js");
const { hoursForAttendance, summarize } = await import("../services/nssProgress.js");
const { academicYearOf, academicYearRange } = await import("../configs/nss.js");

const HOUR = 3_600_000;
let f;

before(startDb);
after(stopDb);
beforeEach(async () => {
  await clearDb();
  f = await seed();
});

// Supertest helper for binary bodies (PDF).
const binary = (res, cb) => {
  const chunks = [];
  res.on("data", (c) => chunks.push(c));
  res.on("end", () => cb(null, Buffer.concat(chunks)));
};

const completedEvent = (overrides = {}) =>
  Event.create({
    title: "Past event",
    description: "d",
    location: "x",
    institution: f.institution._id,
    assignedCoordinators: f.coordinator._id,
    assignedTeacher: [f.teacher._id],
    participants: [f.volunteer._id],
    status: "Completed",
    date: new Date(),
    calculatedHours: 10,
    attendance: [{ student: f.volunteer._id, status: "Present" }],
    ...overrides,
  });

describe("academic years", () => {
  it("June starts a new academic year", () => {
    assert.equal(academicYearOf(new Date(2025, 5, 1)), "2025-26");
    assert.equal(academicYearOf(new Date(2026, 4, 31)), "2025-26");
    assert.equal(academicYearOf(new Date(2026, 0, 10)), "2025-26");
    assert.equal(academicYearRange("2025-27"), null);
  });
});

describe("hours per attendance record", () => {
  const start = new Date("2025-08-01T09:00:00Z");
  const event = { startTime: start, endTime: new Date(start.getTime() + 4 * HOUR), calculatedHours: 4 };

  it("absent earns 0, manual present earns full duration", () => {
    assert.equal(hoursForAttendance(event, { status: "Absent" }), 0);
    assert.equal(hoursForAttendance(event, { status: "Present" }), 4);
  });

  it("QR check-in/out earns actual time, clipped to the event", () => {
    const att = {
      status: "Present",
      checkInAt: new Date(start.getTime() - HOUR), // arrived early: clipped
      checkOutAt: new Date(start.getTime() + 2.5 * HOUR),
    };
    assert.equal(hoursForAttendance(event, att), 2.5);
  });

  it("no check-out means present until the event ended", () => {
    const att = { status: "Present", checkInAt: new Date(start.getTime() + HOUR) };
    assert.equal(hoursForAttendance(event, att), 3);
  });
});

describe("NSS eligibility", () => {
  it("needs 240 hours and a special camp", () => {
    const e = (hours, category = "regular", date = new Date(2025, 7, 1)) => ({
      hours, category, date, academicYear: academicYearOf(date), title: "t", eventId: "x",
    });
    let s = summarize([e(130), e(115, "regular", new Date(2026, 7, 1))]);
    assert.equal(s.totalHours, 245);
    assert.equal(s.eligible, false); // no camp
    assert.equal(s.yearsCompleted, 1);

    s = summarize([e(130), e(115, "special_camp", new Date(2026, 7, 1))]);
    assert.equal(s.eligible, true);
    assert.equal(s.status, "completed");
    assert.equal(s.percent, 100);
  });
});

describe("QR attendance", () => {
  const startEvent = () =>
    request(app).put(`/api/events/${f.event._id}/start`).set(bearer(f.coordinator, "coordinator"));
  const qr = (who, role) =>
    request(app).get(`/api/events/${f.event._id}/qr`).set(bearer(who, role));
  const checkin = (who, token) =>
    request(app).post("/api/events/checkin").set(bearer(who, "student")).send({ token });

  it("QR is only available for running events, to assigned staff", async () => {
    assert.equal((await qr(f.teacher, "teacher")).status, 400); // Upcoming
    await startEvent();
    assert.equal((await qr(f.otherTeacher, "teacher")).status, 403);
    assert.equal((await qr(f.volunteer, "student")).status, 403);
    const ok = await qr(f.teacher, "teacher");
    assert.equal(ok.status, 200);
    assert.match(ok.body.url, /\/checkin\?t=/);
    assert.equal(ok.body.stats.participants, 1);
  });

  it("first scan checks in, early rescan is refused, later scan checks out", async () => {
    await startEvent();
    const { token } = (await qr(f.teacher, "teacher")).body;

    let res = await checkin(f.volunteer, token);
    assert.equal(res.status, 200);
    assert.equal(res.body.action, "checked_in");

    res = await checkin(f.volunteer, token);
    assert.equal(res.status, 409);
    assert.equal(res.body.code, "too_soon");

    // Pretend they checked in 2 hours ago.
    await Event.updateOne(
      { _id: f.event._id, "attendance.student": f.volunteer._id },
      { $set: { "attendance.$.checkInAt": new Date(Date.now() - 2 * HOUR) } }
    );
    res = await checkin(f.volunteer, (await qr(f.teacher, "teacher")).body.token);
    assert.equal(res.body.action, "checked_out");

    res = await checkin(f.volunteer, (await qr(f.teacher, "teacher")).body.token);
    assert.equal(res.body.code, "done");
  });

  it("non-participants, expired codes and forged codes are rejected", async () => {
    await startEvent();
    const { token } = (await qr(f.teacher, "teacher")).body;
    assert.equal((await checkin(f.outsider, token)).status, 403);

    const expired = jwt.sign(
      { e: String(f.event._id), exp: Math.floor(Date.now() / 1000) - 5 },
      `${process.env.JWT_SECRET}:attendance-qr`
    );
    const res = await checkin(f.volunteer, expired);
    assert.equal(res.status, 400);
    assert.equal(res.body.code, "expired");

    // A login token is not a QR token (different signing key).
    const login = jwt.sign({ e: String(f.event._id) }, process.env.JWT_SECRET);
    assert.equal((await checkin(f.volunteer, login)).body.code, "invalid");
  });

  it("completion credits the time actually present", async () => {
    await startEvent();
    await checkin(f.volunteer, (await qr(f.teacher, "teacher")).body.token);
    const now = Date.now();
    await Event.updateOne(
      { _id: f.event._id },
      {
        startTime: new Date(now - 5 * HOUR),
        "attendance.0.checkInAt": new Date(now - 3 * HOUR),
        "attendance.0.checkOutAt": new Date(now - HOUR),
      }
    );
    const res = await request(app)
      .put(`/api/events/${f.event._id}/complete`)
      .set(bearer(f.coordinator, "coordinator"));
    assert.equal(res.status, 200);
    const s = await Student.findById(f.volunteer._id);
    assert.ok(Math.abs(s.totalVolunteerHours - 2) < 0.02, `got ${s.totalVolunteerHours}`);
    const ev = await Event.findById(f.event._id);
    assert.ok(Math.abs(ev.attendance[0].hours - 2) < 0.02);
  });
});

describe("manual attendance", () => {
  const mark = (who, list) =>
    request(app)
      .post(`/api/teacher/attendance/${f.event._id}`)
      .set(bearer(who, "teacher"))
      .send({ attendanceList: list });

  it("unassigned teachers cannot mark attendance", async () => {
    const res = await mark(f.otherTeacher, [{ studentId: String(f.volunteer._id), status: "Present" }]);
    assert.equal(res.status, 403);
  });

  it("non-participants and bad statuses are skipped", async () => {
    const res = await mark(f.teacher, [
      { studentId: String(f.volunteer._id), status: "Present" },
      { studentId: String(f.outsider._id), status: "Present" },
      { studentId: String(f.volunteer._id), status: "Maybe" },
    ]);
    assert.equal(res.status, 200);
    assert.equal(res.body.skipped.length, 2);
    const ev = await Event.findById(f.event._id);
    assert.equal(ev.attendance.length, 1);
    assert.equal(ev.attendance[0].status, "Present");
  });
});

describe("progress endpoints", () => {
  it("student sees own progress; coordinator sees institution", async () => {
    await completedEvent({ calculatedHours: 10 });
    await completedEvent({ calculatedHours: 6, category: "special_camp" });

    const mine = await request(app).get("/api/students/nss-progress").set(bearer(f.volunteer, "student"));
    assert.equal(mine.status, 200);
    assert.equal(mine.body.progress.totalHours, 16);
    assert.equal(mine.body.progress.specialCampDone, true);
    assert.equal(mine.body.progress.events.length, 2);

    const all = await request(app).get("/api/coordinator/nss-progress").set(bearer(f.coordinator, "coordinator"));
    assert.equal(all.status, 200);
    const row = all.body.volunteers.find((v) => v.student.name === "Vol");
    assert.equal(row.totalHours, 16);
    assert.equal(row.events, undefined); // list view stays light
  });
});

describe("certificates", () => {
  const download = (path) =>
    request(app).get(path).set(bearer(f.volunteer, "student")).buffer(true).parse(binary);

  it("absent volunteers get no certificate", async () => {
    const ev = await completedEvent({ attendance: [{ student: f.volunteer._id, status: "Absent" }] });
    const res = await request(app).get(`/api/students/generate/${ev._id}`).set(bearer(f.volunteer, "student"));
    assert.equal(res.status, 403);
  });

  it("present volunteers get a PDF; re-download reuses the same code; anyone can verify it", async () => {
    const ev = await completedEvent();
    const res = await download(`/api/students/generate/${ev._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.headers["content-type"], "application/pdf");
    assert.equal(res.body.subarray(0, 4).toString(), "%PDF");

    await download(`/api/students/generate/${ev._id}`);
    assert.equal(await Certificate.countDocuments(), 1);

    const { code } = await Certificate.findOne();
    const verify = await request(app).get(`/api/certificates/verify/${code}`);
    assert.equal(verify.status, 200);
    assert.equal(verify.body.certificate.valid, true);
    assert.equal(verify.body.certificate.studentName, "Vol");
    assert.equal(verify.body.certificate.hours, 10);
    assert.equal(verify.body.certificate.eventTitle, "Past event");

    const list = await request(app).get("/api/students/certificates").set(bearer(f.volunteer, "student"));
    assert.equal(list.body.certificates[0].code, code);
  });

  it("unknown codes 404; revoked certificates verify as invalid", async () => {
    assert.equal((await request(app).get("/api/certificates/verify/ZZZZZZZZZZ")).status, 404);
    assert.equal((await request(app).get("/api/certificates/verify/$bad")).status, 404);

    const ev = await completedEvent();
    await download(`/api/students/generate/${ev._id}`);
    const { code } = await Certificate.findOne();

    const other = await request(app)
      .put(`/api/certificates/${code}/revoke`)
      .set(bearer(f.volunteer, "student"))
      .send({ reason: "x" });
    assert.equal(other.status, 403);

    const res = await request(app)
      .put(`/api/certificates/${code}/revoke`)
      .set(bearer(f.coordinator, "coordinator"))
      .send({ reason: "Issued in error" });
    assert.equal(res.status, 200);
    const verify = await request(app).get(`/api/certificates/verify/${code}`);
    assert.equal(verify.body.certificate.valid, false);
    assert.equal(verify.body.certificate.revokedReason, "Issued in error");
  });

  it("completion certificate requires eligibility", async () => {
    await completedEvent({ calculatedHours: 100 });
    let res = await request(app).get("/api/students/nss-certificate").set(bearer(f.volunteer, "student"));
    assert.equal(res.status, 403);
    assert.equal(res.body.progress.remainingHours, 140);

    await completedEvent({ calculatedHours: 140, category: "special_camp" });
    res = await download("/api/students/nss-certificate");
    assert.equal(res.status, 200);
    assert.equal(res.body.subarray(0, 4).toString(), "%PDF");
    const cert = await Certificate.findOne({ type: "nss_completion" });
    assert.equal(cert.snapshot.hours, 240);
  });
});

describe("annual report", () => {
  const year = academicYearOf(new Date());
  const get = (who, role, qs = "") =>
    request(app).get(`/api/reports/annual?year=${year}${qs}`).set(bearer(who, role));

  it("summarises the institution's year", async () => {
    await completedEvent({ calculatedHours: 4, title: "=HYPERLINK(\"http://evil\")" });
    const res = await get(f.coordinator, "coordinator");
    assert.equal(res.status, 200);
    const { totals, events, topVolunteers } = res.body.report;
    assert.equal(totals.events, 2); // seeded upcoming event + completed one
    assert.equal(totals.volunteerHours, 4);
    assert.equal(totals.activeVolunteers, 1);
    assert.equal(totals.attendanceRate, 100);
    assert.equal(events.length, 2);
    assert.equal(topVolunteers[0].name, "Vol");
    assert.equal(res.body.summary, null);
  });

  it("CSV escapes formula injection; PDF renders", async () => {
    await completedEvent({ title: "=HYPERLINK(\"http://evil\")" });
    const csv = await get(f.coordinator, "coordinator", "&format=csv");
    assert.equal(csv.status, 200);
    assert.match(csv.text, /'=HYPERLINK/);

    const pdf = await get(f.coordinator, "coordinator", "&format=pdf").buffer(true).parse(binary);
    assert.equal(pdf.status, 200);
    assert.equal(pdf.body.subarray(0, 4).toString(), "%PDF");
  });

  it("access control and validation", async () => {
    assert.equal((await get(f.volunteer, "student")).status, 403);
    assert.equal((await get(f.admin, "admin")).status, 400); // admin must pick an institution
    assert.equal((await get(f.admin, "admin", `&institution=${f.institution._id}`)).status, 200);
    const bad = await request(app).get("/api/reports/annual?year=2025").set(bearer(f.coordinator, "coordinator"));
    assert.equal(bad.status, 400);
  });
});

describe("event status & category rules", () => {
  const editEvent = (body) =>
    request(app)
      .put(`/api/coordinator/events/${f.event._id}`)
      .set(bearer(f.coordinator, "coordinator"))
      .send(body);

  it("cannot jump to Completed via edit (would skip hour crediting)", async () => {
    const res = await editEvent({ status: "Completed" });
    assert.equal(res.status, 400);
    assert.equal((await Event.findById(f.event._id)).status, "Upcoming");

    const res2 = await request(app)
      .post("/api/coordinator/updateeventstatus")
      .set(bearer(f.coordinator, "coordinator"))
      .send({ eventId: f.event._id, status: "Ongoing" });
    assert.equal(res2.status, 400);
  });

  it("can cancel and reinstate; can set category", async () => {
    assert.equal((await editEvent({ status: "Cancelled", category: "special_camp" })).status, 200);
    let ev = await Event.findById(f.event._id);
    assert.equal(ev.status, "Cancelled");
    assert.equal(ev.category, "special_camp");
    assert.equal((await editEvent({ status: "Upcoming" })).status, 200);
    ev = await Event.findById(f.event._id);
    assert.equal(ev.status, "Upcoming");
  });
});

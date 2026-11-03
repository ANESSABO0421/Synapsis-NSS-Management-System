import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { bearer, clearDb, seed, startDb, stopDb } from "./helpers.js";

const { default: app } = await import("../app.js");
const { default: Event } = await import("../models/Event.js");
const { default: Student } = await import("../models/Student.js");
const { default: Admin } = await import("../models/Admin.js");
const { default: Message } = await import("../models/Message.js");

let f; // fixtures

before(startDb);
after(stopDb);
beforeEach(async () => {
  await clearDb();
  f = await seed();
});

describe("previously unauthenticated routes now require a token", () => {
  const cases = [
    ["delete", (f) => `/api/events/deleteevent/${f.event._id}`],
    ["put", (f) => `/api/events/updateevent/${f.event._id}`],
    ["post", (f) => `/api/events/assigntoevent/${f.event._id}`],
    ["delete", (f) => `/api/events/${f.event._id}/images/abc`],
    ["get", (f) => `/api/events/participantsofevents/${f.event._id}`],
    ["post", () => `/api/students/admin-student-create`],
    ["put", (f) => `/api/students/approve-student/${f.volunteer._id}`],
    ["put", (f) => `/api/students/update-student/${f.volunteer._id}`],
    ["delete", (f) => `/api/students/delete-student/${f.volunteer._id}`],
    ["get", (f) => `/api/students/student-events/${f.volunteer._id}`],
    ["put", (f) => `/api/teacher/update/${f.volunteer._id}/${f.event._id}`],
    ["delete", (f) => `/api/teacher/delete/${f.volunteer._id}/${f.event._id}`],
    ["get", (f) => `/api/chat/events/${f.event._id}/messages`],
    ["post", () => `/api/ai/generate`],
    ["post", (f) => `/api/events/${f.event._id}/uploadimages`],
  ];

  for (const [method, path] of cases) {
    it(`${method.toUpperCase()} ${path({ event: { _id: ":id" }, volunteer: { _id: ":id" } })} -> 401`, async () => {
      const res = await request(app)[method](path(f));
      assert.equal(res.status, 401);
    });
  }

  it("unprotected POST /api/coordinator/approvecoordinator is gone", async () => {
    const res = await request(app).post("/api/coordinator/approvecoordinator");
    assert.equal(res.status, 404);
  });

  it("data was not touched by anonymous delete", async () => {
    await request(app).delete(`/api/events/deleteevent/${f.event._id}`);
    assert.ok(await Event.findById(f.event._id));
  });
});

describe("event ownership", () => {
  it("a student cannot delete an event", async () => {
    const res = await request(app)
      .delete(`/api/events/deleteevent/${f.event._id}`)
      .set(bearer(f.volunteer, "student"));
    assert.equal(res.status, 403);
  });

  it("a coordinator cannot edit another coordinator's event", async () => {
    const res = await request(app)
      .put(`/api/events/updateevent/${f.event._id}`)
      .set(bearer(f.otherCoordinator, "coordinator"))
      .send({ title: "hijacked" });
    assert.equal(res.status, 403);
    assert.equal((await Event.findById(f.event._id)).title, "Beach cleanup");
  });

  it("the assigned coordinator can edit their event (including location)", async () => {
    const res = await request(app)
      .put(`/api/events/updateevent/${f.event._id}`)
      .set(bearer(f.coordinator, "coordinator"))
      .send({ title: "Beach cleanup v2", location: "North beach" });
    assert.equal(res.status, 200);
    const ev = await Event.findById(f.event._id);
    assert.equal(ev.title, "Beach cleanup v2");
    assert.equal(ev.location, "North beach");
  });

  it("deleting an event removes it from students' assignedEvents", async () => {
    await Student.updateOne({ _id: f.volunteer._id }, { $push: { assignedEvents: f.event._id } });
    const res = await request(app)
      .delete(`/api/events/deleteevent/${f.event._id}`)
      .set(bearer(f.admin, "admin"));
    assert.equal(res.status, 200);
    const s = await Student.findById(f.volunteer._id);
    assert.equal(s.assignedEvents.length, 0);
  });

  it("invalid event id returns 400, not 500", async () => {
    const res = await request(app)
      .put(`/api/events/updateevent/not-an-id`)
      .set(bearer(f.admin, "admin"));
    assert.equal(res.status, 400);
  });

  it("unassigned teacher cannot see participants", async () => {
    const res = await request(app)
      .get(`/api/events/participantsofevents/${f.event._id}`)
      .set(bearer(f.otherTeacher, "teacher"));
    assert.equal(res.status, 403);
  });

  it("assigned teacher can see participants", async () => {
    const res = await request(app)
      .get(`/api/events/participantsofevents/${f.event._id}`)
      .set(bearer(f.teacher, "teacher"));
    assert.equal(res.status, 200);
    assert.equal(res.body.participants.length, 1);
    assert.equal(res.body.participants[0].name, "Vol");
  });
});

describe("admin account updates", () => {
  it("an admin cannot change another admin's password", async () => {
    const res = await request(app)
      .put(`/api/admin/updateadmin/${f.superadmin._id}`)
      .set(bearer(f.admin, "admin"))
      .send({ password: "Hacked@1234" });
    assert.equal(res.status, 403);
  });

  it("an admin cannot promote themselves", async () => {
    const res = await request(app)
      .put(`/api/admin/updateadmin/${f.admin._id}`)
      .set(bearer(f.admin, "admin"))
      .send({ name: "Renamed", role: "superadmin", status: "active" });
    assert.equal(res.status, 200);
    const a = await Admin.findById(f.admin._id);
    assert.equal(a.name, "Renamed");
    assert.equal(a.role, "admin");
  });

  it("a student hitting the admin route gets 403, not a 500 crash", async () => {
    const res = await request(app)
      .put(`/api/admin/updateadmin/${f.admin._id}`)
      .set(bearer(f.volunteer, "student"))
      .send({ name: "x" });
    assert.equal(res.status, 403);
  });

  it("superadmin can change another admin's role", async () => {
    const res = await request(app)
      .put(`/api/admin/updateadmin/${f.admin._id}`)
      .set(bearer(f.superadmin, "superadmin"))
      .send({ status: "inactive" });
    assert.equal(res.status, 200);
    assert.equal((await Admin.findById(f.admin._id)).status, "inactive");
  });

  it("legacy admin tokens without a role claim still work", async () => {
    const jwt = (await import("jsonwebtoken")).default;
    const legacy = jwt.sign({ id: f.admin._id }, process.env.JWT_SECRET);
    const res = await request(app)
      .get("/api/admin/profile")
      .set("Authorization", `Bearer ${legacy}`);
    assert.equal(res.status, 200);
  });
});

describe("responses never leak secrets", () => {
  it("approve-student response has no password/otp", async () => {
    await Student.updateOne({ _id: f.volunteer._id }, { otp: 123456 });
    const res = await request(app)
      .put(`/api/students/approve-student/${f.volunteer._id}`)
      .set(bearer(f.admin, "admin"));
    assert.equal(res.status, 200);
    assert.equal(res.body.student.password, undefined);
    assert.equal(res.body.student.otp, undefined);
  });
});

describe("grace marks", () => {
  const assign = (who, role, body) =>
    request(app).post("/api/teacher/grace-marks").set(bearer(who, role)).send(body);

  it("unassigned teacher cannot assign marks", async () => {
    const res = await assign(f.otherTeacher, "teacher", {
      studentId: f.volunteer._id, eventId: f.event._id, marks: 5,
    });
    assert.equal(res.status, 403);
  });

  it("cannot assign marks to a non-participant", async () => {
    const res = await assign(f.teacher, "teacher", {
      studentId: f.outsider._id, eventId: f.event._id, marks: 5,
    });
    assert.equal(res.status, 400);
  });

  it("rejects negative or absurd marks", async () => {
    for (const marks of [-1, 1000, "abc"]) {
      const res = await assign(f.teacher, "teacher", {
        studentId: f.volunteer._id, eventId: f.event._id, marks,
      });
      assert.equal(res.status, 400, `marks=${marks}`);
    }
  });

  it("assigned teacher can assign, update and delete marks", async () => {
    let res = await assign(f.teacher, "teacher", {
      studentId: f.volunteer._id, eventId: f.event._id, marks: 5,
    });
    assert.equal(res.status, 200);
    assert.equal((await Student.findById(f.volunteer._id)).graceMarks, 5);

    res = await request(app)
      .put(`/api/teacher/update/${f.volunteer._id}/${f.event._id}`)
      .set(bearer(f.teacher, "teacher"))
      .send({ marks: 8 });
    assert.equal(res.status, 200);
    assert.equal((await Student.findById(f.volunteer._id)).graceMarks, 8);

    res = await request(app)
      .delete(`/api/teacher/delete/${f.volunteer._id}/${f.event._id}`)
      .set(bearer(f.teacher, "teacher"));
    assert.equal(res.status, 200);
    assert.equal((await Student.findById(f.volunteer._id)).graceMarks, 0);
  });
});

describe("event chat", () => {
  it("non-members cannot read the chat", async () => {
    const res = await request(app)
      .get(`/api/chat/events/${f.event._id}/messages`)
      .set(bearer(f.outsider, "student"));
    assert.equal(res.status, 403);
  });

  it("non-members cannot post", async () => {
    const res = await request(app)
      .post(`/api/chat/student/send`)
      .set(bearer(f.outsider, "student"))
      .send({ eventId: f.event._id, content: "hi" });
    assert.equal(res.status, 403);
  });

  it("a participant can post and read; message stored exactly once", async () => {
    const send = await request(app)
      .post(`/api/chat/student/send`)
      .set(bearer(f.volunteer, "student"))
      .send({ eventId: f.event._id, content: "hello team" });
    assert.equal(send.status, 201);

    const read = await request(app)
      .get(`/api/chat/events/${f.event._id}/messages`)
      .set(bearer(f.coordinator, "coordinator"));
    assert.equal(read.status, 200);
    assert.equal(read.body.messages.length, 1);
    assert.equal(read.body.messages[0].sender.role, "volunteer");
    assert.equal(await Message.countDocuments(), 1);
  });
});

describe("AI endpoint", () => {
  it("students are not allowed", async () => {
    const res = await request(app)
      .post("/api/ai/generate")
      .set(bearer(f.volunteer, "student"))
      .send({ prompt: "hi" });
    assert.equal(res.status, 403);
  });

  it("oversized prompts are rejected before calling the LLM", async () => {
    const res = await request(app)
      .post("/api/ai/generate")
      .set(bearer(f.coordinator, "coordinator"))
      .send({ prompt: "x".repeat(5000) });
    assert.equal(res.status, 400);
  });
});

describe("account status", () => {
  it("rejected users are blocked even with a valid token", async () => {
    await Student.updateOne({ _id: f.volunteer._id }, { status: "rejected" });
    const res = await request(app)
      .get("/api/students/profile")
      .set(bearer(f.volunteer, "student"));
    assert.equal(res.status, 403);
  });
});

describe("misc", () => {
  it("unknown routes return JSON 404", async () => {
    const res = await request(app).get("/api/nope");
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  it("public event list does not expose attendance/participants", async () => {
    const res = await request(app).get("/api/events/getallevent");
    assert.equal(res.status, 200);
    assert.equal(res.body.events[0].participants, undefined);
    assert.equal(res.body.events[0].attendance, undefined);
  });
});

describe("mentorship messages (REST)", () => {
  it("a volunteer can send a message (senderRole enum bug)", async () => {
    const { default: Mentorship } = await import("../models/Mentorship.js");
    const m = await Mentorship.create({
      mentor: f.alumni._id, mentee: f.volunteer._id, topic: "Careers", status: "active",
    });
    const res = await request(app)
      .post(`/api/mentorshipmessage/studentchat/${m._id}`)
      .set(bearer(f.volunteer, "student"))
      .send({ message: "hello" });
    assert.equal(res.status, 200);
    assert.equal(res.body.newMessage.senderRole, "student");
  });
});

describe("admin dashboard stats", () => {
  it("total students includes volunteers (never less than active)", async () => {
    const res = await request(app).get("/api/admin/dashboardata").set(bearer(f.admin, "admin"));
    assert.equal(res.status, 200);
    const s = res.body.Data.student;
    assert.ok(s.total >= s.active, `total ${s.total} < active ${s.active}`);
  });
});

describe("profile updates persist (found by type-checking)", () => {
  it("coordinator phone is saved; institution cannot be changed", async () => {
    const { default: Coordinator } = await import("../models/Coordinator.js");
    const { default: Institution } = await import("../models/Institution.js");
    const other = await Institution.create({ name: "Other College" });
    const res = await request(app)
      .put("/api/coordinator/updateProfile")
      .set(bearer(f.coordinator, "coordinator"))
      .send({ phone: "8888888888", institution: String(other._id) });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.phone, "8888888888");
    const c = await Coordinator.findById(f.coordinator._id);
    assert.equal(c.phoneNumber, "8888888888");
    assert.equal(String(c.institution), String(f.institution._id));
  });

  it("admin phone and department are saved", async () => {
    const res = await request(app)
      .put("/api/admin/profile")
      .set(bearer(f.admin, "admin"))
      .send({ phoneNumber: "7777777777", department: "Physics" });
    assert.equal(res.status, 200);
    const a = await Admin.findById(f.admin._id);
    assert.equal(a.phoneNumber, "7777777777");
    assert.equal(a.department, "Physics");
  });
});

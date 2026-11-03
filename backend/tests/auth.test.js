import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { clearDb, seed, startDb, stopDb } from "./helpers.js";

const { default: app } = await import("../app.js");
const { default: Student } = await import("../models/Student.js");
const { default: Coordinator } = await import("../models/Coordinator.js");
const { default: Admin } = await import("../models/Admin.js");

let f;
const PASSWORD = "Secret@123";

before(startDb);
after(stopDb);
beforeEach(async () => {
  await clearDb();
  f = await seed();
  const hash = await bcrypt.hash(PASSWORD, 4);
  await Promise.all([
    Student.updateOne({ _id: f.volunteer._id }, { password: hash }),
    Coordinator.updateOne({ _id: f.coordinator._id }, { password: hash }),
    Admin.updateOne({ _id: f.superadmin._id }, { password: hash }),
  ]);
});

const login = (body) => request(app).post("/api/auth/login").send(body);

describe("POST /api/auth/login", () => {
  it("logs a volunteer in with uiRole student and token role volunteer", async () => {
    const res = await login({ email: f.volunteer.email, password: PASSWORD });
    assert.equal(res.status, 200);
    assert.equal(res.body.role, "student");
    assert.equal(jwt.decode(res.body.token).role, "student");
    assert.equal(res.body.user.role, "volunteer");
    assert.equal(res.body.user.password, undefined);
  });

  it("superadmin token carries the superadmin role", async () => {
    const res = await login({ email: f.superadmin.email, password: PASSWORD });
    assert.equal(res.status, 200);
    assert.equal(res.body.role, "admin");
    assert.equal(jwt.decode(res.body.token).role, "superadmin");
  });

  it("token works on protected routes", async () => {
    const { body } = await login({ email: f.volunteer.email, password: PASSWORD });
    const res = await request(app)
      .get("/api/students/profile")
      .set("Authorization", `Bearer ${body.token}`);
    assert.equal(res.status, 200);
  });

  it("wrong password and unknown email give the same response", async () => {
    const a = await login({ email: f.volunteer.email, password: "nope" });
    const b = await login({ email: "ghost@test.dev", password: "nope" });
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.deepEqual(a.body, b.body);
  });

  it("pending accounts are refused only after the password matches", async () => {
    await Coordinator.updateOne({ _id: f.coordinator._id }, { status: "pending" });
    const wrong = await login({ email: f.coordinator.email, password: "nope" });
    assert.equal(wrong.status, 401); // no status leak without the password
    const right = await login({ email: f.coordinator.email, password: PASSWORD });
    assert.equal(right.status, 403);
  });

  it("legacy coordinator login now enforces status", async () => {
    await Coordinator.updateOne({ _id: f.coordinator._id }, { status: "pending" });
    const res = await request(app)
      .post("/api/coordinator/logincoordinator")
      .send({ email: f.coordinator.email, password: PASSWORD });
    assert.equal(res.status, 403);
  });
});

describe("input validation & NoSQL injection", () => {
  it("operator objects in login are rejected", async () => {
    const res = await login({ email: { $ne: null }, password: { $ne: null } });
    assert.equal(res.status, 400);
  });

  it("operator objects on legacy login are rejected", async () => {
    const res = await request(app)
      .post("/api/students/studentlogin")
      .send({ email: { $regex: ".*" }, password: PASSWORD });
    assert.equal(res.status, 400);
  });

  it("malformed OTP payloads are rejected with field errors", async () => {
    const res = await request(app)
      .post("/api/otp/verify-otp")
      .send({ id: "not-an-id", otp: "12", role: "hacker" });
    assert.equal(res.status, 400);
    const fields = res.body.errors.map((e) => e.field).sort();
    assert.deepEqual(fields, ["id", "otp", "role"]);
  });

  it("$-keys are stripped from nested bodies", async () => {
    // Coordinator update: `status: {$ne: ...}` must not survive sanitization.
    const res = await request(app)
      .put(`/api/coordinator/updatestudents/${f.volunteer._id}`)
      .set("Authorization", `Bearer ${jwt.sign({ id: f.coordinator._id, role: "coordinator" }, process.env.JWT_SECRET)}`)
      .send({ department: "EEE", status: { $ne: "x" } });
    assert.equal(res.status, 200);
    const s = await Student.findById(f.volunteer._id);
    assert.equal(s.department, "EEE");
    assert.equal(s.status, "active");
  });
});

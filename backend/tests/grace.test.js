import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { bearer, clearDb, seed, startDb, stopDb } from "./helpers.js";

const { default: app } = await import("../app.js");
const { default: Event } = await import("../models/Event.js");
const { default: Student } = await import("../models/Student.js");

let f;
before(startDb);
after(stopDb);
beforeEach(async () => {
  await clearDb();
  f = await seed();
  await Event.updateOne({ _id: f.event._id }, { status: "Completed" });
});

const recommend = (marks) =>
  request(app)
    .post("/api/coordinator/recommendgracemark")
    .set(bearer(f.coordinator, "coordinator"))
    .send({ studentId: f.volunteer._id, marks, reason: "Great work" });

const decide = (who, approve) =>
  request(app)
    .put("/api/teacher/approverecommendedgracemark")
    .set(bearer(who, "teacher"))
    .send({ studentId: f.volunteer._id, approve });

const marksOf = async () => (await Student.findById(f.volunteer._id)).graceMarks;

describe("grace mark recommendations", () => {
  it("rejects invalid recommended marks", async () => {
    for (const m of [-5, 500, "x"]) {
      assert.equal((await recommend(m)).status, 400, `marks=${m}`);
    }
  });

  it("approval adds marks exactly once", async () => {
    assert.equal((await recommend(6)).status, 200);
    assert.equal((await decide(f.teacher, true)).status, 200);
    assert.equal(await marksOf(), 6);

    const again = await decide(f.teacher, true);
    assert.equal(again.status, 409);
    assert.equal(await marksOf(), 6);
  });

  it("rejection does not add marks but is recorded", async () => {
    await recommend(6);
    assert.equal((await decide(f.teacher, false)).status, 200);
    assert.equal(await marksOf(), 0);
    const s = await Student.findById(f.volunteer._id);
    const entry = s.graceHistory.at(-1);
    assert.equal(entry.status, "rejected");
    assert.equal(entry.source, "recommendation");
    assert.equal(entry.reason, "Great work");
    assert.equal(s.pendingGraceRecommendation.status, "rejected");
    assert.ok(s.pendingGraceRecommendation.reviewedBy);
  });

  it("teachers not on the student's events cannot decide", async () => {
    await recommend(6);
    assert.equal((await decide(f.otherTeacher, true)).status, 403);
    assert.equal(await marksOf(), 0);
  });

  it("a new recommendation is allowed after a decision; totals accumulate", async () => {
    await recommend(4);
    await decide(f.teacher, true);
    assert.equal((await recommend(3)).status, 200);
    await decide(f.teacher, true);
    assert.equal(await marksOf(), 7);
  });

  it("student dashboard does not overwrite grace marks", async () => {
    await recommend(4);
    await decide(f.teacher, true);
    const res = await request(app)
      .get("/api/students/dashboard")
      .set(bearer(f.volunteer, "student"));
    assert.equal(res.status, 200);
    assert.equal(await marksOf(), 4);
  });
});

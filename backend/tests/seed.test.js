import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startDb, stopDb } from "./helpers.js";

const { default: app } = await import("../app.js");
const { seed, DEMO_PASSWORD } = await import("../scripts/seed.js");
const { default: Student } = await import("../models/Student.js");
const { default: Event } = await import("../models/Event.js");

before(startDb);
after(stopDb);

describe("seed script", () => {
  it("is idempotent and every demo role can log in", async () => {
    await seed();
    await seed(); // re-run must not duplicate
    assert.equal(await Student.countDocuments({ email: /@demo\.synapsis\.test$/ }), 6);
    assert.equal(await Event.countDocuments(), 3);

    const expected = {
      superadmin: "admin", admin: "admin", coordinator: "coordinator",
      teacher: "teacher", volunteer1: "student", alumni: "alumni",
    };
    for (const [who, role] of Object.entries(expected)) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: `${who}@demo.synapsis.test`, password: DEMO_PASSWORD });
      assert.equal(res.status, 200, who);
      assert.equal(res.body.role, role, who);
    }
  });
});

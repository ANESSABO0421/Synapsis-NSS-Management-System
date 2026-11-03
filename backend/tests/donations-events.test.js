import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { bearer, clearDb, seed, startDb, stopDb } from "./helpers.js";

const { default: app } = await import("../app.js");
const { stripe } = await import("../utils/stripe.js");
const { default: Event } = await import("../models/Event.js");
const { default: Donation } = await import("../models/Donation.js");
const { default: Student } = await import("../models/Student.js");

let f;
const realRetrieve = stripe.paymentIntents.retrieve;

before(startDb);
after(stopDb);
beforeEach(async () => {
  await clearDb();
  f = await seed();
});
afterEach(() => {
  stripe.paymentIntents.retrieve = realRetrieve;
});

// Fake Stripe: one succeeded ₹500 intent owned by f.alumni.
const stubIntent = (overrides = {}) => {
  stripe.paymentIntents.retrieve = async (id) => ({
    id,
    status: "succeeded",
    amount_received: 50000,
    metadata: { eventId: String(f.event._id), alumniId: String(f.alumni._id) },
    ...overrides,
  });
};

const save = (who, body) =>
  request(app).post("/api/donations/save").set(bearer(who, "alumni")).send(body);

describe("donations", () => {
  it("uses Stripe's amount, not the client's", async () => {
    stubIntent();
    const res = await save(f.alumni, { paymentId: "pi_1", amount: 9999999, eventId: f.event._id });
    assert.equal(res.status, 200);
    const ev = await Event.findById(f.event._id);
    assert.equal(ev.totalCollected, 500);
    assert.equal((await Donation.findOne()).amount, 500);
  });

  it("replaying the same payment does not double-count", async () => {
    stubIntent();
    await save(f.alumni, { paymentId: "pi_2" });
    const again = await save(f.alumni, { paymentId: "pi_2" });
    assert.equal(again.status, 200);
    assert.equal(await Donation.countDocuments(), 1);
    assert.equal((await Event.findById(f.event._id)).totalCollected, 500);
  });

  it("cannot claim someone else's payment", async () => {
    stubIntent();
    const res = await save(f.otherAlumni, { paymentId: "pi_3" });
    assert.equal(res.status, 403);
    assert.equal(await Donation.countDocuments(), 0);
  });

  it("unsucceeded payments are not recorded", async () => {
    stubIntent({ status: "requires_payment_method" });
    const res = await save(f.alumni, { paymentId: "pi_4" });
    assert.equal(res.status, 400);
    assert.equal(await Donation.countDocuments(), 0);
  });

  it("rejects malformed payment ids without calling Stripe", async () => {
    let called = false;
    stripe.paymentIntents.retrieve = async () => { called = true; };
    const res = await save(f.alumni, { paymentId: { $ne: null } });
    assert.equal(res.status, 400);
    assert.equal(called, false);
  });

  it("donor list: alumni only see their own donations", async () => {
    stubIntent();
    await save(f.alumni, { paymentId: "pi_5" });
    const res = await request(app)
      .get(`/api/donations/event/${f.event._id}`)
      .set(bearer(f.otherAlumni, "alumni"));
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 0);
  });

  it("donor list: event coordinator sees all, other coordinators are denied", async () => {
    stubIntent();
    await save(f.alumni, { paymentId: "pi_6" });
    const mine = await request(app)
      .get(`/api/donations/event/${f.event._id}`)
      .set(bearer(f.coordinator, "coordinator"));
    assert.equal(mine.status, 200);
    assert.equal(mine.body.length, 1);

    const notMine = await request(app)
      .get(`/api/donations/event/${f.event._id}`)
      .set(bearer(f.otherCoordinator, "coordinator"));
    assert.equal(notMine.status, 403);
  });
});

describe("event lifecycle", () => {
  const run = async (coordinator) => {
    await request(app).put(`/api/events/${f.event._id}/start`).set(bearer(coordinator, "coordinator"));
    // Pretend the event ran for 3 hours with the volunteer present.
    await Event.updateOne(
      { _id: f.event._id },
      {
        startTime: new Date(Date.now() - 3 * 3_600_000),
        attendance: [{ student: f.volunteer._id, status: "Present" }],
      }
    );
    return request(app).put(`/api/events/${f.event._id}/complete`).set(bearer(coordinator, "coordinator"));
  };

  it("another coordinator cannot start/complete the event", async () => {
    const res = await request(app)
      .put(`/api/events/${f.event._id}/start`)
      .set(bearer(f.otherCoordinator, "coordinator"));
    assert.equal(res.status, 403);
  });

  it("completing credits hours (populate on Student ref works)", async () => {
    const res = await run(f.coordinator);
    assert.equal(res.status, 200);
    const s = await Student.findById(f.volunteer._id);
    assert.ok(s.totalVolunteerHours >= 2.99 && s.totalVolunteerHours <= 3.01);
    assert.equal(s.level, "Bronze");
  });

  it("awards are not duplicated across events", async () => {
    await run(f.coordinator);
    // Second event, same level.
    await Event.updateOne({ _id: f.event._id }, { status: "Upcoming" });
    await run(f.coordinator);
    const s = await Student.findById(f.volunteer._id);
    const bronze = s.awards.filter((a) => a.title === "Bronze Volunteer");
    assert.equal(bronze.length, 1);
  });
});

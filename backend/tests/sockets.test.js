import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import request from "supertest";
import { Server } from "socket.io";
import { io as connect } from "socket.io-client";
import { bearer, clearDb, seed, startDb, stopDb, tokenFor } from "./helpers.js";

const { default: app } = await import("../app.js");
const { registerSockets } = await import("../sockets/index.js");
const { default: Mentorship } = await import("../models/Mentorship.js");
const { default: MentorshipMessage } = await import("../models/MentorshipMessage.js");

let f, server, io, url;
const clients = [];

const client = (doc, role, nsp = "") => {
  const c = connect(`${url}${nsp}`, {
    auth: { token: tokenFor(doc, role) },
    transports: ["websocket"],
    forceNew: true,
  });
  clients.push(c);
  return c;
};

const once = (socket, evt, ms = 2000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${evt}`)), ms);
    socket.once(evt, (data) => {
      clearTimeout(t);
      resolve(data);
    });
  });

const nothing = (socket, evt, ms = 300) =>
  new Promise((resolve, reject) => {
    const handler = () => reject(new Error(`unexpected ${evt}`));
    socket.once(evt, handler);
    setTimeout(() => {
      socket.off(evt, handler);
      resolve();
    }, ms);
  });

before(async () => {
  await startDb();
  server = http.createServer(app);
  io = new Server(server);
  app.set("io", io);
  registerSockets(io);
  await new Promise((r) => server.listen(0, r));
  url = `http://localhost:${server.address().port}`;
});

after(async () => {
  clients.forEach((c) => c.disconnect());
  io.close();
  await new Promise((r) => server.close(r));
  await stopDb();
});

beforeEach(async () => {
  clients.splice(0).forEach((c) => c.disconnect());
  await clearDb();
  f = await seed();
});

describe("socket auth", () => {
  it("rejects connections without a token", async () => {
    const c = connect(url, { transports: ["websocket"], forceNew: true });
    clients.push(c);
    const err = await once(c, "connect_error");
    assert.match(err.message, /token/i);
  });
});

describe("event chat realtime", () => {
  it("members get receive_message when someone posts via REST; outsiders are refused", async () => {
    const coord = client(f.coordinator, "coordinator");
    const outsider = client(f.outsider, "student");
    await Promise.all([once(coord, "connect"), once(outsider, "connect")]);

    outsider.emit("join_event", String(f.event._id));
    const refusal = await once(outsider, "error_message");
    assert.match(refusal, /not a member/);

    coord.emit("join_event", String(f.event._id));
    await new Promise((r) => setTimeout(r, 100)); // let the join complete

    const received = once(coord, "receive_message");
    const silent = nothing(outsider, "receive_message");

    const res = await request(app)
      .post("/api/chat/student/send")
      .set(bearer(f.volunteer, "student"))
      .send({ eventId: f.event._id, content: "live!" });
    assert.equal(res.status, 201);

    const msg = await received;
    assert.equal(msg.content, "live!");
    assert.equal(msg.eventId, String(f.event._id)); // plain string so client === works
    await silent;
  });
});

describe("mentorship chat", () => {
  it("only mentor/mentee of an active mentorship can join and send", async () => {
    const m = await Mentorship.create({
      mentor: f.alumni._id,
      mentee: f.volunteer._id,
      topic: "Careers",
      status: "active",
    });
    const id = String(m._id);

    const intruder = client(f.otherAlumni, "alumni", "/mentorship-chat");
    const mentor = client(f.alumni, "alumni", "/mentorship-chat");
    const mentee = client(f.volunteer, "student", "/mentorship-chat");
    await Promise.all([intruder, mentor, mentee].map((c) => once(c, "connect")));

    intruder.emit("joinMentorship", { mentorshipId: id });
    assert.match(await once(intruder, "error_message"), /access/);

    mentor.emit("joinMentorship", { mentorshipId: id });
    mentee.emit("joinMentorship", { mentorshipId: id });
    await new Promise((r) => setTimeout(r, 150));

    // Intruder never joined -> their send is ignored.
    intruder.emit("sendMentorMessage", { mentorshipId: id, message: "spam" });

    const got = once(mentor, "newMentorMessage");
    mentee.emit("sendMentorMessage", { mentorshipId: id, message: "hi mentor" });
    const msg = await got;
    assert.equal(msg.message, "hi mentor");
    assert.equal(msg.senderRole, "student"); // volunteer maps to schema enum

    // Typing relay works (was never forwarded before).
    const typing = once(mentor, "typing");
    mentee.emit("typing", { mentorshipId: id });
    await typing;

    assert.equal(await MentorshipMessage.countDocuments({ message: "spam" }), 0);
  });
});

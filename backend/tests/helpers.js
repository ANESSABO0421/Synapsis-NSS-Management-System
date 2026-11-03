// Test harness: in-memory MongoDB + fixtures + JWT helpers.
// Env must be set before app.js is imported (configs/env.js validates it).
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.MONGODB_URL ??= "mongodb://placeholder";
process.env.STRIPE_SECRET_KEY ??= "sk_test_placeholder";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongod;

export const startDb = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // Build unique indexes (e.g. Donation.paymentId) before tests rely on them.
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
};

export const stopDb = async () => {
  await mongoose.disconnect();
  await mongod?.stop();
};

export const clearDb = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
  );
};

export const tokenFor = (doc, role) =>
  jwt.sign({ id: doc._id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const bearer = (doc, role) => ({ Authorization: `Bearer ${tokenFor(doc, role)}` });

let seq = 0;
const uniq = (prefix) => `${prefix}${++seq}@test.dev`;

/** A small institution: admin, 2 coordinators, 2 teachers, 2 volunteers, alumni, 1 event. */
export const seed = async () => {
  const { default: Institution } = await import("../models/Institution.js");
  const { default: Admin } = await import("../models/Admin.js");
  const { default: Coordinator } = await import("../models/Coordinator.js");
  const { default: Teacher } = await import("../models/Teacher.js");
  const { default: Student } = await import("../models/Student.js");
  const { default: Alumni } = await import("../models/Alumni.js");
  const { default: Event } = await import("../models/Event.js");

  const institution = await Institution.create({ name: "Test College" });
  const base = { phoneNumber: "9999999999", department: "CS", password: "hashed", institution: institution._id };

  const admin = await Admin.create({ name: "Admin", email: uniq("admin"), role: "admin", status: "active" });
  const otherAdmin = await Admin.create({ name: "Other", email: uniq("admin"), role: "admin", status: "active" });
  const superadmin = await Admin.create({ name: "Super", email: uniq("super"), role: "superadmin", status: "active" });

  const coordinator = await Coordinator.create({ ...base, name: "Coord", email: uniq("coord"), status: "active" });
  const otherCoordinator = await Coordinator.create({ ...base, name: "Coord2", email: uniq("coord"), status: "active" });
  const teacher = await Teacher.create({ ...base, name: "Teach", email: uniq("teach"), status: "active" });
  const otherTeacher = await Teacher.create({ ...base, name: "Teach2", email: uniq("teach"), status: "active" });
  const volunteer = await Student.create({ ...base, name: "Vol", email: uniq("vol"), talents: ["music"], role: "volunteer", status: "active" });
  const outsider = await Student.create({ ...base, name: "Out", email: uniq("vol"), talents: ["art"], role: "volunteer", status: "active" });
  const alumni = await Alumni.create({ ...base, name: "Alum", email: uniq("alum"), graduationYear: "2020", status: "active" });
  const otherAlumni = await Alumni.create({ ...base, name: "Alum2", email: uniq("alum"), graduationYear: "2021", status: "active" });

  const event = await Event.create({
    title: "Beach cleanup",
    description: "Clean the beach",
    date: new Date(),
    location: "Beach",
    institution: institution._id,
    assignedCoordinators: coordinator._id,
    assignedTeacher: [teacher._id],
    participants: [volunteer._id],
  });

  return {
    institution, admin, otherAdmin, superadmin, coordinator, otherCoordinator,
    teacher, otherTeacher, volunteer, outsider, alumni, otherAlumni, event,
  };
};

/**
 * Demo data: one institution with a user for every role and a few events.
 *
 *   npm run seed            # uses MONGODB_URL from .env
 *
 * Safe to re-run: it only deletes/recreates records whose email ends in
 * @demo.synapsis.test (and the demo institution / its events). Refuses to run
 * with NODE_ENV=production.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";

dotenv.config();

import Admin from "../models/Admin.js";
import Alumni from "../models/Alumni.js";
import Coordinator from "../models/Coordinator.js";
import Event from "../models/Event.js";
import Institution from "../models/Institution.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

export const DEMO_PASSWORD = "Demo@1234";
const DOMAIN = "demo.synapsis.test";
const INSTITUTION_NAME = "SYNAPSIS DEMO COLLEGE";
const demoEmail = (local) => `${local}@${DOMAIN}`;
const DEMO_EMAIL = new RegExp(`@${DOMAIN.replace(/\./g, "\\.")}$`);

const day = (offset) => new Date(Date.now() + offset * 86_400_000);

export async function seed() {
  const institutionFilter = { name: INSTITUTION_NAME };
  const old = await Institution.findOne(institutionFilter);
  if (old) await Event.deleteMany({ institution: old._id });
  await Promise.all(
    [Admin, Alumni, Coordinator, Student, Teacher].map((M) => M.deleteMany({ email: DEMO_EMAIL }))
  );
  await Institution.deleteMany(institutionFilter);

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const institution = await Institution.create({
    name: INSTITUTION_NAME,
    address: "1 Campus Road",
    contactEmail: demoEmail("office"),
  });
  const base = { password, phoneNumber: "9000000000", institution: institution._id, status: "active" };

  await Admin.create({ name: "Demo Superadmin", email: demoEmail("superadmin"), password, role: "superadmin", status: "active" });
  await Admin.create({ name: "Demo Admin", email: demoEmail("admin"), password, role: "admin", status: "active" });

  const coordinator = await Coordinator.create({ ...base, name: "Priya Coordinator", email: demoEmail("coordinator"), department: "NSS Cell" });
  const teacher = await Teacher.create({ ...base, name: "Rahul Teacher", email: demoEmail("teacher"), department: "Computer Science", verifiedByAdmin: true });

  const talents = [["music"], ["photography"], ["first aid"], ["public speaking"], ["design"]];
  const volunteers = await Student.insertMany(
    talents.map((t, i) => ({
      ...base,
      name: `Volunteer ${i + 1}`,
      email: demoEmail(`volunteer${i + 1}`),
      department: i % 2 ? "Commerce" : "Science",
      talents: t,
      role: "volunteer",
    }))
  );
  await Student.create({ ...base, name: "Student Applicant", email: demoEmail("student"), department: "Arts", talents: ["writing"], role: "student" });
  await Alumni.create({ ...base, name: "Anita Alumni", email: demoEmail("alumni"), department: "Science", graduationYear: "2019" });

  const common = {
    institution: institution._id,
    assignedCoordinators: coordinator._id,
    assignedTeacher: [teacher._id],
    participants: volunteers.map((v) => v._id),
  };
  const events = await Event.insertMany([
    { ...common, title: "Campus Tree Plantation", description: "Plant 200 saplings around the campus.", location: "Main Campus", date: day(-20), hours: 4, status: "Completed",
      attendance: volunteers.map((v, i) => ({ student: v._id, status: i < 4 ? "Present" : "Absent", markedBy: teacher._id })) },
    { ...common, title: "Blood Donation Camp", description: "Organise a blood donation drive with the district hospital.", location: "Auditorium", date: day(-3), hours: 6, status: "Ongoing", startTime: day(-3) },
    { ...common, title: "Village Literacy Drive", description: "Weekend teaching sessions in the adopted village.", location: "Adopted Village", date: day(10), hours: 8, status: "Upcoming", donationOpen: true },
  ]);

  await Student.updateMany({ _id: { $in: volunteers.map((v) => v._id) } }, { $set: { assignedEvents: events.map((e) => e._id) } });
  await Teacher.updateOne({ _id: teacher._id }, { $set: { assignedEvents: events.map((e) => e._id) } });
  await Coordinator.updateOne({ _id: coordinator._id }, { $set: { managedEvents: events.map((e) => e._id) } });
  await Institution.updateOne(
    { _id: institution._id },
    { $set: { coordinators: [coordinator._id], teacher: [teacher._id], students: volunteers.map((v) => v._id), Events: events.map((e) => e._id) } }
  );

  return { institution, coordinator, teacher, volunteers, events };
}

// fileURLToPath handles spaces in the path (import.meta.url encodes them as %20).
const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to seed with NODE_ENV=production.");
    process.exit(1);
  }
  if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL is not set (see .env.example).");
    process.exit(1);
  }
  const host = process.env.MONGODB_URL.replace(/\/\/[^@]*@/, "//***@");
  console.log(`Seeding demo data into ${host}`);
  await mongoose.connect(process.env.MONGODB_URL);
  await seed();
  await mongoose.disconnect();
  console.log(`\nDone. Log in with any of these (password: ${DEMO_PASSWORD}):`);
  for (const who of ["superadmin", "admin", "coordinator", "teacher", "volunteer1", "student", "alumni"]) {
    console.log(`  ${demoEmail(who)}`);
  }
}

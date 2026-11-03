import stripSecrets from "../utils/stripSecrets.js";

import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    department: { type: String, required: true },
    talents: { type: [String], required: true },
    profileImage: {
      url: { type: String },
      public_id: { type: String },
    },
    role: {
      type: String,
      enum: ["student", "volunteer"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    // Ledger of every grace-mark decision. graceMarks is derived from it.
    graceHistory: [
      {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        marks: { type: Number, default: 0, min: 0 },
        date: { type: Date, default: Date.now },
        source: {
          type: String,
          enum: ["teacher", "recommendation"],
          default: "teacher",
        },
        reason: { type: String, default: "" },
        // Legacy entries have no status and count as approved.
        status: {
          type: String,
          enum: ["approved", "rejected"],
          default: "approved",
        },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
      },
    ],
    graceMarks: { type: Number, default: 0 },
    password: { type: String, required: true },
    otp: { type: Number },
    otpExpiry: { type: Date },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // Grace mark Recommendation
    pendingGraceRecommendation: {
      type: new mongoose.Schema(
        {
          marks: { type: Number, default: 0 },
          reason: { type: String, default: "" },
          recommendedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coordinator",
          },
          assignedTeachers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
          ],
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
          // These were written by the controller but silently dropped before.
          date: { type: Date, default: Date.now },
          reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
          reviewedDate: { type: Date },
        },
        { _id: false }
      ),
      default: null,
    },
    assignedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

    // =============================
    // Volunteer Tracking & Awards
    // =============================
    totalVolunteerHours: { type: Number, default: 0 },
    awards: [
      {
        title: { type: String }, // e.g., "Bronze Volunteer"
        description: { type: String }, // e.g., "Completed 10 hours"
        date: { type: Date, default: Date.now },
      },
    ],
    level: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
  },
  { timestamps: true }
);

// add the mark
StudentSchema.pre("save", function (next) {
  // Only approved entries count; rejected recommendations stay for the record.
  this.graceMarks = this.graceHistory.reduce(
    (sum, rec) => (rec.status === "rejected" ? sum : sum + Number(rec.marks || 0)),
    0
  );
  next();
});

StudentSchema.plugin(stripSecrets);

export default mongoose.model("Student", StudentSchema);

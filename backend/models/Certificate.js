import mongoose from "mongoose";

// An issued certificate. Key details are snapshotted so verification stays
// stable even if names/events are later edited or deleted.
const certificateSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["event", "nss_completion"], required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    snapshot: {
      studentName: String,
      department: String,
      institutionName: String,
      eventTitle: String,
      eventDate: Date,
      hours: Number,
    },
    issuedAt: { type: Date, default: Date.now },
    revoked: { type: Boolean, default: false },
    revokedReason: String,
  },
  { timestamps: true }
);

// One certificate per (student, event) and one completion certificate per student.
certificateSchema.index(
  { student: 1, type: 1, event: 1 },
  { unique: true, partialFilterExpression: { type: "event" } }
);
certificateSchema.index(
  { student: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "nss_completion" } }
);

export default mongoose.model("Certificate", certificateSchema);

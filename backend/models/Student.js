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
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    graceMarks: { type: Number, default: 0 },
    password: { type: String, required: true },
    otp: { type: Number },
    otpExpiry: { type: Date },
    // gracemark Recommendation
    pendingGraceRecommendation: {
      marks: { type: Number, default: 0 },
      reason: { type: String, default: "" },
      recommendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coordinator",
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
    assignedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true }
);

export default mongoose.model("student", StudentSchema);

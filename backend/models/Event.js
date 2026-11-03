import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    hours: { type: Number, default: 0, min: [0, "Hours cannot be negative"] },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    assignedTeacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    assignedCoordinators: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coordinator",
    },
    totalCollected: {
      type: Number,
      default: 0,
    },

    donationOpen: {
      type: Boolean,
      default: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // event based award
    startTime: { type: Date },
    endTime: { type: Date },
    calculatedHours: { type: Number, default: 0 },

    attendance: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        status: {
          type: String,
          enum: ["Present", "Absent"],
          default: "Absent",
        },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
        date: { type: Date, default: Date.now },
        markedAt: { type: Date },
        // QR self check-in/out. Manual "Present" without times earns the full event duration.
        method: { type: String, enum: ["manual", "qr"], default: "manual" },
        checkInAt: { type: Date },
        checkOutAt: { type: Date },
        // Hours credited to this student when the event was completed.
        hours: { type: Number, min: 0 },
      },
    ],
    images: [
      {
        url: { type: String },
        public_id: { type: String },
        caption: { type: String, default: "" },
        uploadAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    // NSS distinguishes regular activities from the residential special camp.
    category: {
      type: String,
      enum: ["regular", "special_camp"],
      default: "regular",
    },
  },
  { timestamps: true }
);

eventSchema.index({ institution: 1, status: 1, date: -1 });
eventSchema.index({ "attendance.student": 1, status: 1 });

export default mongoose.model("Event", eventSchema);

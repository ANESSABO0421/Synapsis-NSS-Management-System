import mongoose from "mongoose";

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumni",
      required: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    topic: { type: String, required: true },
    description: { type: String },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    requestDate: { type: Date, default: Date.now },
    startDate: { type: Date },
    endDate: { type: Date },

    // ✅ Add Meet/Zoom Link
    meetingLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v); // ensure it's a valid URL
        },
        message: (props) => `${props.value} is not a valid meeting link!`,
      },
    },

    // Optional session logs
    sessions: [
      {
        sessionDate: { type: Date, default: Date.now },
        notes: { type: String },
        meetingLink: { type: String }, // optional per-session
        feedbackFromMentor: { type: String },
        feedbackFromMentee: { type: String },
      },
    ],

    feedback: {
      mentorRating: { type: Number, min: 1, max: 5 },
      mentorComment: { type: String },
      menteeRating: { type: Number, min: 1, max: 5 },
      menteeComment: { type: String },
    },

    autoComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Mentorship", mentorshipSchema);

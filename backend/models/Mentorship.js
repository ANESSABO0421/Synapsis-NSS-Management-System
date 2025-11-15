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
    startDate: Date,
    endDate: Date,

    meetingLink: String,

    mentorFeedback: {
      rating: Number,
      comment: String,
    },

    menteeFeedback: {
      rating: Number,
      comment: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mentorship", mentorshipSchema);

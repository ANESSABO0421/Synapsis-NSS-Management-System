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
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);

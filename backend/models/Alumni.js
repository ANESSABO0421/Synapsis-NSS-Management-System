import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    graduationYear: { type: String, required: true },
    department: { type: String, required: true },

    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },

    testimonials: [
      {
        message: String,
        visibility: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],

    achievements: [
      {
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Alumni", alumniSchema);

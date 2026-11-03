import mongoose from "mongoose";
import stripSecrets from "../utils/stripSecrets.js";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Collected at signup/profile edit but previously missing from the schema (silently dropped).
    phoneNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    googleId: { type: String },
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    otp: { type: Number },
    otpExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

adminSchema.plugin(stripSecrets);

export default mongoose.model("Admin", adminSchema);

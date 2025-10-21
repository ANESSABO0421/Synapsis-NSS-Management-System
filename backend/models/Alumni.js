import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    graduationYear: { type: String, required: true },
    department: { type: String, required: true },

    otp: { type: String},
    otpExpiry: { type: Date},

    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },

    profileImage: {
      url: { type: String },
      public_id: { type: String },
    },
    institution: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Institution",
  required: true
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

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Teacher from "../../models/Teacher.js";
import { sendEmail } from "../../utils/sendEmail.js";
import Institution from "../../models/Institution.js";

const generateToken = (id) =>
  jwt.sign({ id, role: "teacher" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// signup

export const teacherSignUp = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, password, institutionId } =
      req.body;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8+ chars, include uppercase, lowercase, number, and special character",
      });
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    let profileImage = { url: "", public_id: "" };
    let verificationDocument = { url: "", public_id: "" };

    if (req.files?.profileImage?.[0]) {
      profileImage = {
        url: req.files.profileImage[0].path,
        public_id: req.files.profileImage[0].filename || req.files.profileImage[0].path,
      };
    }

    if (req.files?.verificationDocument?.[0]) {
      verificationDocument = {
        url: req.files.verificationDocument[0].path,
        public_id: req.files.verificationDocument[0].filename || req.files.verificationDocument[0].path,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Verification document is required.",
      });
    }

    const teacher = await Teacher.create({
      name,
      email,
      phoneNumber,
      department,
      password: hashed,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      profileImage,
      institution: institutionId,
      verificationDocument,
      status: "pending", // waiting for admin approval
      verifiedByAdmin: false,
    });

    await Institution.findByIdAndUpdate(institutionId, {
      $push: { teacher: teacher._id },
    });

    // otp
    sendEmail(email, "Verify your Teacher account", `Your OTP is ${otp}`).catch(console.error);

    return res.status(201).json({
      success: true,
      message:
        "Signup successful! Verify OTP sent to your email. Wait for admin approval after verification.",
      userId: teacher._id,
      role: "teacher",
    });
  } catch (error) {
    console.error("Error in teacher signup:", error);
    return res
      .status(500)
      .json({ success: false, message: "Signup failed: " + error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { teacherId, otp } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    if (teacher.otp !== Number(otp) || teacher.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    teacher.otp = null;
    teacher.otpExpiry = null;
    await teacher.save();
    res.json({
      success: true,
      message: "OTP verified. Now wait for admin approval",
      teacher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "teacher not found" });
    }
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) {
      return req
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    if (teacher.status !== "active") {
      return res.status(403).json({ message: "Account not active" });
    }
    const token = generateToken(teacher._id);

    res.json({ success: true, message: "Login succssfully", token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// admin operation

// assign teacher to event

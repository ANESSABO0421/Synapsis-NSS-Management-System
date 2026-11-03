import Student from "../../models/Student.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import Institution from "../../models/Institution.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// Token generation

const generateToken = (student) => {
  return jwt.sign(
    { id: student._id, role: "student" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Student Signup

export const studentSignUp = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      department,
      talents,
      password,
      institution,
    } = req.body;

    const emailExist = await Student.findOne({ email });
    if (emailExist) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    let profileImage = {};
    if (req.file) {
      profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const student = await Student.create({
      name,
      email,
      phoneNumber,
      department,
      talents,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 mins
      status: "pending",
      profileImage,
      institution,
    });

    await Institution.findByIdAndUpdate(institution, {
      $push: { students: student._id },
    });

    sendEmail(email, "Verify your NSS account", `Your OTP is ${otp}`).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Signup successful. Please verify OTP.",
      userId: student._id,
      role: "student",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP

export const verifyOtp = async (req, res) => {
  try {
    const { studentId, otp } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.otp !== Number(otp) || student.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    student.otp = null;
    student.otpExpiry = null;
    await student.save();

    res.json({
      success: true,
      message: "OTP has been verified,now wait for admin approval",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student Login

export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (student.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account not active. Wait for admin approval.",
      });
    }

    const token = generateToken(student);

    res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: "student",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Create Student

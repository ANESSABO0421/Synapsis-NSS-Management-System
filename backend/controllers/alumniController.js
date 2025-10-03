import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Alumni from "../models/Alumni.js";
import { sendEmail } from "../utils/sendEmail.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const genrateToken = (id) =>
  jwt.sign({ id, role: "alumni" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const otpGeneration = () => Math.floor(100000 + Math.random() * 900000);

// signup
export const Signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, graduationYear, department } =
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
          "Password must be 8+ chars, include uppercase, lowercase, number, special characters",
      });
    }

    const exists = await Alumni.findOne({ email: email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Alumni already existed" });
    }

    const otp = otpGeneration();
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);

    const alumni = await Alumni.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      graduationYear,
      department,
      otp,
      otpExpiry,
      status: "pending",
    });

    // passing argument from alrady mention to,subject and text is passed as argument here
    await sendEmail(email, "Verify your Alumni account", `Your OTP:${otp}`);
    res.status(201).json({
      success: true,
      message: "Signup successful.OTP sent to email",
      alumniId: alumni._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { alumniId, otp } = req.body;
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "alumni not found" });
    }
    if (alumni.otp !== Number(otp) || alumni.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
    alumni.otp = null;
    alumni.otpExpiry = null;
    await alumni.save();

    res.json({
      success: true,
      message: "OTP verified.now wait for the approval of admin",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const alumni = await Alumni.findOne({ email });
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alunmni is not found" });
    }
    if (alumni.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is not active yet" });
    }

    const match = await bcrypt.compare(password, alumni.password);
    if (!match) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = genrateToken(alumni._id);
    res.json({ success: true, message: "Login successful", token, alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// approve alumni
export const approveAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }

    alumni.status == "active";
    await alumni.save();
    res.json({ success: true, message: "Alumni approved", alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update alumni
export const updateAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password)
      updates.password = await bcrypt.hash(updates.password, 10);

    const alumni = await Alumni.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!alumni)
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });

    res.json({ success: true, message: "Alumni updated", alumni });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// delete alumni
export const deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }
    res.json({ success: true, message: "Alumni deleted successfully!!!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// add testimonial
export const addTestimonial = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }
    alumni.testimonials.push({ message: req.body.message });
    await alumni.save();
    res.json({ success: true, message: "testimonial submitted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// add achievements
export const addAchievement = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }
    alumni.achievements.push({
      title: req.body.title,
      description: req.body.description,
    });

    await alumni.save();
    res.json({ success: true, message: "Achievement added" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

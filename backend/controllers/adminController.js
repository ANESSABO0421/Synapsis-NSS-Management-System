import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendEmail } from "../utils/sendEmail.js";
import Admin from "../models/Admin.js";
import { generatePassword } from "../utils/passwordGenerator.js";

// regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// token genration
const generateToken = (id) => {
  // three part id,token and expire
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// otp genration
const otpGeneration = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// signup
export const signUp = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, department } = req.body;
    // validation
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid email format" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8+ chars, include uppercase, lowercase, number, special characters",
      });
    }

    const isExist = await Admin.findOne({ email });
    if (isExist) {
      return res
        .status(400)
        .json({ success: false, message: "email already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = otpGeneration();
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    // admin data creation
    const admin = await Admin.create({
      name,
      email,
      department,
      password: hashedPassword,
      otp,
      phoneNumber,
      otpExpiry,
      status: "pending",
    });
    // otp genrate
    await sendEmail(email, otp);
    res.status(201).json({
      success: true,
      message: "OTP sent to email",
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update admin and super admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // prevent from changing status and role
    if (req.admin.role !== "superadmin") {
      delete updates.role;
      delete updates.status;
    }

    // password updation and hash
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updates, {
      // will give the updated one as well else it showly updated succesfull and boolean true
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) {
      return res
        .status(404)
        .json({ success: true, message: "Admin not found" });
    }

    res.json({ success: true, message: "Admin updated sucessfully", admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndDelete(id);
    if (!Admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, message: "Admin updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// otp verify
export const verifyOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    if (admin.otp !== Number(otp) || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ messgae: "invalid otp or expired otp" });
    }

    admin.status = "active";
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    const token = generateToken(admin._id);
    res
      .status(201)
      .json({ success: true, message: "successfully verified", token, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    // verified or not
    if (admin.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account not verified" });
    }

    // match password
    const comparePassword = await bcrypt.compare(password, admin.password);
    if (!comparePassword)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// google callback
export const googleCallback = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin) {
      return res.status(404).json({ message: "google auth failed" });
    }

    if (admin.status === "pending") {
      admin.status = "active";
      await admin.save();
    }

    const token = generateToken(admin._id);
    res.json({ message: "Google login success", token, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// super admin
export const createAdminBySuperadmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const admin = await Admin.create({
      name,
      email,
      phoneNumber,
      department,
      role,
      password: hashedPassword,
      status: "active",
    });

    await sendEmail(
      email,
      "Your NSS Admin Account",
      `Your account has been created. Temporary password: ${rawPassword}`
    );

    res.status(201).json({ message: "Admin created by superadmin", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

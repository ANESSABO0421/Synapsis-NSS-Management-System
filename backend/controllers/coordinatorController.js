import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Coordinator from "../models/Coordinator.js";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
const generateToken = (id) =>
  jwt.sign({ id, role: "coordinator" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const coordinatorSignup = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, password } = req.body;
    if (!name || !email || !phoneNumber || !department || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields" });
    }

    const exist = await Coordinator.findOne({ email });
    if (exist) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exist" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    let profileImage = { url: "", public_id: "" };
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "coordinator_profiles",
      });
      profileImage = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }
    const coordinator = await Coordinator.create({
      name,
      email,
      phoneNumber,
      department,
      password: hashed,
      otp,
      otpExpiry,
      profileImage,
    });

    await sendEmail(email, "Verify Coordinator Account", `Your OTP: ${otp}`);
    res.status(201).json({
      success: true,
      message: "Successfully created Coordinator verify Otp now",
      coordinator: coordinator._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const coordinator = await Coordinator.findOne({ email });
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinator Not Found" });
    }
    if (coordinator.otp != Number(otp) || coordinator.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Otp or Otp expired" });
    }
    coordinator.otp = null;
    coordinator.otpExpiry = null;
    await coordinator.save();
    res.status(201).json({
      success: true,
      message: "Otp verified successfully.wait for admin approval",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

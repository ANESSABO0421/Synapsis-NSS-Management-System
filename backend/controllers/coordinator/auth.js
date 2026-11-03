import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Coordinator from "../../models/Coordinator.js";
import { sendEmail } from "../../utils/sendEmail.js";
import Institution from "../../models/Institution.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const generateToken = (id) =>
  jwt.sign({ id, role: "coordinator" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const coordinatorSignup = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, password, institutionId } =
      req.body;
    if (
      !name ||
      !email ||
      !phoneNumber ||
      !department ||
      !password ||
      !institutionId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields" });
    }

    // Validate institution exists
    const inst = await Institution.findById(institutionId);
    if (!inst) {
      return res
        .status(404)
        .json({ success: false, message: "Institution not found" });
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
    let verificationDocument = { url: "", public_id: "" };

    if (req.files?.profileImage?.[0]) {
      profileImage = {
        url: req.files.profileImage[0].path,
        public_id: req.files.profileImage[0].filename || req.files.profileImage[0].path,
      };
    }

    // verification document
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
    const coordinator = await Coordinator.create({
      name,
      email,
      phoneNumber,
      department,
      password: hashed,
      institution: institutionId,
      role: "coordinator",
      status: "pending",
      profileImage,
      verificationDocument,
      otp,
      otpExpiry,
    });
    // Link to Institution
    await Institution.findByIdAndUpdate(institutionId, {
      $push: { coordinators: coordinator._id },
    });

    sendEmail(email, "Verify Coordinator Account", `Your OTP: ${otp}`).catch(console.error);
    res.status(201).json({
      success: true,
      message: "Successfully created Coordinator verify Otp now",
      userId: coordinator._id,
      role: "coordinator",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// verify otp

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

// login

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const coordinator = await Coordinator.findOne({ email }).populate(
      "institution",
      "name address"
    );
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinator is not found" });
    }
    const match = await bcrypt.compare(password, coordinator.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credential" });
    }
    if (coordinator.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account not active. Wait for admin approval." });
    }

    const token = generateToken(coordinator._id);
    // Return institution info with coordinator so frontend can scope queries
    res.json({
      success: true,
      message: "Login successfully",
      token,
      coordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// create event

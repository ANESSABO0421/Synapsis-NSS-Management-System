import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Coordinator from "../models/Coordinator.js";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import Event from "../models/Event.js";
import Student from "../models/Student.js";

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

// approve coordinator
export const approveCoordinator = async (req, res) => {
  try {
    const { coordinatorId } = req.body;
    const coordinator = await Coordinator.findById(coordinatorId);
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinator Not found" });
    }
    coordinator.status = "active";
    await coordinator.save();
    res.json({ success: true, message: "Coordinator has been approved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const coordinator = await Coordinator.findOne({ email });
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinatr is not found" });
    }
    const match = await bcrypt.compare(password, coordinator.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credential" });
    }
    const token = generateToken(coordinator._id);
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
export const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, hours } = req.body;
    if (!title || !description || !location || !date || !hours) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields" });
    }
    let imageData = null;
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "event_images",
      });
      imageData = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
        caption: req.body.caption || "",
      };
    }
    const newEvent = await Event.create({
      title,
      description,
      location,
      date,
      hours: hours || 0,
      assignedCoordinators: req.user._id,
      createdBy: req.user._id,
      images: imageData ? [imageData] : [],
      status: "Upcoming",
    });

    // update as well on the coordinator events manging array
    await Coordinator.findByIdAndUpdate(req.user._id, {
      $push: { managedEvents: newEvent._id },
    });
    res.json({
      success: true,
      message: "new Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get student by their skill
export const getStudentBySkill = async (req, res) => {
  try {
    const { skills } = req.params;
    if (!skills) {
      return res
        .status(400)
        .json({ success: false, message: "Skills required" });
    }

    const students = await Student.find({
      // $regex is a mongodb query for matching the skill
      talents: { $regex: `^${skills}$`, $options: "i" }, // exact-ish match; adjust as needed
      role: "student",
      status: "active",
    }).select("name email department skills status");
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// student to volunteer
export const studentToVolunteer = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    student.role = "volunteer";
    await student.save();
    res.json({
      success: true,
      message: "changed student to volunteer",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const volunteerTostudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    student.role = "student";
    await student.save();
    res.json({
      success: true,
      message: "changed volunteer to student",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

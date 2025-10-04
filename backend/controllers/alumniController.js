import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Alumni from "../models/Alumni.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "../utils/cloudinary.js";

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

    let profileImage = {};
    if (req.file) {
      profileImage = { url: req.file.path, public_id: req.file.filename };
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
      profileImage,
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
    const { otp } = req.body; // OTP comes from body
    const alumni = await Alumni.findById(req.params.id); // ID comes from URL params
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }

    if (alumni.otp !== otp || alumni.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    alumni.otp = null;
    alumni.otpExpiry = null;
    await alumni.save();

    res.json({
      success: true,
      message: "OTP verified. Now wait for admin approval",
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

    alumni.status = "active";
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
    const alumni = await Alumni.findById(id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }

    const { name, phoneNumber, graduationYear, department } = req.body;
    if (name) alumni.name = name;
    if (phoneNumber) alumni.phoneNumber = phoneNumber;
    if (graduationYear) alumni.graduationYear = graduationYear;
    if (department) alumni.department = department;

    if (req.file) {
      if (alumni.profileImage?.public_id) {
        await cloudinary.uploader.destroy(alumni.profileImage.public_id);
      }
      alumni.profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await alumni.save();
    res.json({ success: true, message: "Alumni updated successfully", alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete alumni
export const deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }

    // delete the id of image public_id
    if (alumni.profileImage?.public_id) {
      await cloudinary.uploader.destroy(alumni.profileImage.public_id);
    }

    await alumni.deleteOne();

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

export const updateTestimonialVisibility = async (req, res) => {
  try {
    const { id, testimonialId } = req.params; // ✅ route param fix
    const { visibility } = req.body; // "approved" | "rejected"

    const alumni = await Alumni.findById(id);
    if (!alumni) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni not found" });
    }

    const testimonial = alumni.testimonials.id(testimonialId);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    testimonial.visibility = visibility;
    await alumni.save();

    res.json({
      success: true,
      message: `Testimonial visibility updated to ${visibility}`,
      testimonial,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get top 3 testimonials
export const getTopTestimonial = async (req, res) => {
  try {
    const alumni = await Alumni.find({ "testimonials.visibility": "approved" })
      .select("name department graduationYear profileImage testimonials")
      .lean();
    const approvedTestimonials = alumni
      .flatMap((a) =>
        a.testimonials
          .filter((t) => t.visibility === "approved")
          .map((t) => ({
            alumniId: a._id,
            name: a.name,
            department: a.department,
            graduationYear: a.graduationYear,
            profileImage: a.profileImage?.url,
            message: t.message,
          }))
      )
      .slice(0, 3);
    res.json({ success: true, testimonials: approvedTestimonials });
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

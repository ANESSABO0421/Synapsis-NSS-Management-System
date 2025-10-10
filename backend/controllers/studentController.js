import Student from "../models/Student.js";
import bcrypt from "bcrypt";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import Event from "../models/Event.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

// OTP generation (6 digits)
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
    const { name, email, phoneNumber, department, talents, password } =
      req.body;

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
    });

    await sendEmail(email, "Verify your NSS account", `Your OTP is ${otp}`);

    res.status(201).json({
      success: true,
      message: "Signup successful. Please verify OTP.",
      studentId: student._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const student = await Student.findOne({ email });
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

    res.json({ success: true, message: "OTP has been verified" });
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
export const adminCreateStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, talents, password } =
      req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Student already exists" });
    }

    let profileImage = {};
    if (req.file) {
      profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      phoneNumber,
      department,
      talents,
      password: hashedPassword,
      status: "active", // directly active when created by admin
      profileImage,
    });

    res.status(201).json({
      success: true,
      message: "Student created by admin successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve Student
export const approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    student.status = "active";
    await student.save();

    res.json({
      success: true,
      message: "Student approved successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Student (Details + Image)
export const studentUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const { name, phoneNumber, department, talents, status } = req.body;

    if (name) student.name = name;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (department) student.department = department;
    if (talents) {
      student.talents = Array.isArray(talents) ? talents : [talents];
    }

    if (status) student.status = status; // should only be set by admin

    if (req.file) {
      if (student.profileImage?.public_id) {
        await cloudinary.uploader.destroy(student.profileImage.public_id);
      }
      student.profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await student.save();

    res.json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.profileImage?.public_id) {
      await cloudinary.uploader.destroy(student.profileImage.public_id);
    }

    await student.deleteOne();

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Student Events
export const getStudentEvents = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "assignedEvents",
      "title description date location hours"
    );

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, events: student.assignedEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Student from Event
export const removeStudentFromEvent = async (req, res) => {
  try {
    const { studentId, eventId } = req.params;

    const student = await Student.findById(studentId);
    const event = await Event.findById(eventId);

    if (!student || !event) {
      return res
        .status(404)
        .json({ success: false, message: "Student or Event not found" });
    }

    student.assignedEvents = student.assignedEvents.filter(
      (id) => id.toString() !== eventId
    );
    await student.save();

    event.participants = event.participants.filter(
      (id) => id.toString() !== studentId
    );
    await event.save();

    res.json({
      success: true,
      message: "Student removed from event successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// certificate genration
export const generateOwnCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const event = await Event.findById(eventId).populate(
      "participants",
      "_id name department"
    );
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Certificate available only after event completion",
      });
    }

    const isParticipant = event.participants.some(
      (p) => p._id.toString() === studentId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You did not participate in this event",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Folder setup
    const folder = path.join("uploads", "certificates");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const fileName = `certificate_${event._id}_${student._id}.pdf`;
    const filePath = path.join(folder, fileName);

    const doc = new PDFDocument({ layout: "landscape", size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    /* ============ Certificate Design ============ */

    // Colors & styling
    const mainColor = "#003366";
    const accentColor = "#D4AF37"; // gold
    const textColor = "#1a1a1a";

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FAFAFA");
    doc.fillColor(textColor);

    // Border
    doc
      .lineWidth(12)
      .strokeColor(mainColor)
      .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
      .stroke();

    // Inner thin border
    doc
      .lineWidth(2)
      .strokeColor(accentColor)
      .rect(45, 45, doc.page.width - 90, doc.page.height - 90)
      .stroke();

    // Watermark logo (light)
    const logoPath = "public/nss-logo.png"; // path to your NSS logo
    if (fs.existsSync(logoPath)) {
      doc.opacity(0.08);
      doc.image(logoPath, doc.page.width / 2 - 150, doc.page.height / 2 - 150, {
        width: 300,
      });
      doc.opacity(1);
    }

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor(mainColor)
      .text("National Service Scheme (NSS)", { align: "center" });

    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#333")
      .text(
        "Under the Ministry of Youth Affairs and Sports, Government of India",
        {
          align: "center",
        }
      );

    // Title
    doc.moveDown(2);
    doc
      .font("Times-BoldItalic")
      .fontSize(34)
      .fillColor(accentColor)
      .text("Certificate of Appreciation", { align: "center" });

    // Decorative line
    const lineY = doc.y + 10;
    doc
      .moveTo(180, lineY)
      .lineTo(doc.page.width - 180, lineY)
      .lineWidth(2)
      .stroke(accentColor);

    // Recipient name
    doc.moveDown(2);
    doc
      .font("Times-BoldItalic")
      .fontSize(32)
      .fillColor("#000")
      .text(student.name, { align: "center" });

    // Text body
    doc.moveDown(1.5);
    doc
      .font("Times-Roman")
      .fontSize(18)
      .fillColor("#333333")
      .text(
        `of the ${
          student.department
        } Department is hereby awarded this certificate in recognition of their valuable participation in the event "${
          event.title
        }", conducted on ${new Date(event.date).toLocaleDateString()}.`,
        {
          align: "center",
          lineGap: 10,
          indent: 40,
        }
      );

    // Signature lines
    const sigY = doc.page.height - 130;

    doc
      .font("Helvetica")
      .fontSize(14)
      .text("_________________________", 150, sigY)
      .text("_________________________", doc.page.width - 350, sigY);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Program Officer", 150, sigY + 15)
      .text("Principal / NSS Coordinator", doc.page.width - 350, sigY + 15);

    // Footer
    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("#666")
      .text(
        "Generated by SYNAPSIS NSS Management Portal",
        0,
        doc.page.height - 50,
        {
          align: "center",
        }
      );

    /* ============================================ */

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) console.error("File download error:", err);
        fs.unlink(filePath, () => {});
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

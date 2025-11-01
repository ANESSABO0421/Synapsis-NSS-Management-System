import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Coordinator from "../models/Coordinator.js";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import Event from "../models/Event.js";
import Student from "../models/Student.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Teacher from "../models/Teacher.js";
import Institution from "../models/Institution.js";
import { HfInference } from "@huggingface/inference";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
const generateToken = (id) =>
  jwt.sign({ id, role: "coordinator" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

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

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "coordinator_profiles",
      });
      profileImage = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

    // verification document
    if (req.files?.verificationDocument?.[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.verificationDocument[0].path,
        { folder: "coordinator_verify_documents" }
      );
      verificationDocument = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
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
      otp,
      verificationDocument,
      otpExpiry,
      profileImage,
      institution: institutionId,
    });
    await Institution.findByIdAndUpdate(institutionId, {
      $push: { coordinators: coordinator._id },
    });

    await sendEmail(email, "Verify Coordinator Account", `Your OTP: ${otp}`);
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
export const createEvent = async (req, res) => {
  try {
    // Removed institutionId from required fields — will use coordinator's institution
    const { title, description, location, date, hours } = req.body;
    if (!title || !description || !location || !date || !hours) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields" });
    }

    // fetch coordinator to get institution
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const institutionId = coordinator.institution;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Coordinator not assigned to institution",
      });
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
      institution: institutionId,
      createdBy: req.user._id,
      images: imageData ? [imageData] : [],
      status: "Upcoming",
    });

    await Institution.findByIdAndUpdate(institutionId, {
      $push: { Events: newEvent._id },
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

    // scope students to coordinator's institution
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const students = await Student.find({
      // $regex is a mongodb query for matching the skill
      talents: { $regex: `^${skills}$`, $options: "i" }, // exact-ish match; adjust as needed
      role: "student",
      status: "active",
      institution: coordinator.institution,
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
    // ensure coordinator only toggles students from their institution
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const student = await Student.findOne({
      _id: studentId,
      institution: coordinator.institution,
    });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your institution",
      });
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
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const student = await Student.findOne({
      _id: studentId,
      institution: coordinator.institution,
    });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your institution",
      });
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

// assign voulnteer to event
export const assignVoulnteerToEvent = async (req, res) => {
  try {
    const { eventId, volunteerIds } = req.body;
    if (!eventId || !Array.isArray(volunteerIds) || volunteerIds.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "eventId and volunteerIds required" });

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // ensure event belongs to coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message:
          "Cannot assign volunteers to an event outside your institution",
      });
    }

    // ensure the provided id is volunteer and from same institution
    const volunteer = await Student.find({
      _id: { $in: volunteerIds },
      role: "volunteer",
      status: "active",
      institution: coordinator.institution,
    });
    if (!volunteer.length) {
      return res.status(400).json({
        success: false,
        message: "No volunteer found in your institution",
      });
    }

    // add participants without duplicates
    const volunteerObjectIds = volunteer.map((v) => v._id);
    await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { participants: { $each: volunteerObjectIds } } },
      { new: true }
    );

    // also add assigned event to each student's assignedEvents
    await Student.updateMany(
      { _id: { $in: volunteerObjectIds } },
      { $addToSet: { assignedEvents: event._id } }
    );

    const updatedEvent = await Event.findById(eventId).populate(
      "participants",
      "name email department role"
    );

    res.json({
      success: true,
      message: "Volunteers assigned",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// recommendation mark
// export const recommendedGraceMark = async (req, res) => {
//   try {
//     const { studentId, marks, reason } = req.body;
//     if (!studentId || typeof marks === undefined) {
//       return res
//         .status(400)
//         .json({ success: false, message: "studentId and marks required" });
//     }

//     const coordinator = await Coordinator.findById(req.user._id);
//     if (!coordinator) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     const student = await Student.findOne({
//       _id: studentId,
//       institution: coordinator.institution,
//     });
//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found in your institution",
//       });
//     }

//     student.pendingGraceRecommendation = {
//       marks: Number(marks),
//       reason: reason || "",
//       recommendedBy: req.user._id,
//       status: "pending",
//     };
//     await student.save();

//     await Coordinator.findByIdAndUpdate(req.user._id, {
//       $push: {
//         graceRecommendations: {
//           student: studentId,
//           marks: Number(marks),
//           reason: reason || "",
//         },
//       },
//     });

//     res.json({
//       success: true,
//       message: "Grace mark recommendation submitted",
//       student,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// 📘 Grace Mark Recommendation (Coordinator recommends)
export const recommendedGraceMark = async (req, res) => {
  try {
    const { studentId, marks, reason } = req.body;

    if (!studentId || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: "studentId and marks are required",
      });
    }

    // Verify coordinator identity
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if student belongs to same institution
    const student = await Student.findOne({
      _id: studentId,
      institution: coordinator.institution,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your institution",
      });
    }

    // ✅ Ensure student is an NSS volunteer
    if (student.role!=="volunteer") {
      return res.status(400).json({
        success: false,
        message: "This student is not an NSS volunteer",
      });
    }

    // ✅ Check if already has pending recommendation
    if (
      student.pendingGraceRecommendation &&
      student.pendingGraceRecommendation.status === "pending"
    ) {
      return res.status(400).json({
        success: false,
        message: "This student already has a pending grace mark request",
      });
    }

    // ✅ Optional: check if student has completed at least one event
    const completedEvents = await Event.find({
      participants: student._id,
      status: "Completed",
    });

    if (completedEvents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student has not participated in any completed NSS events",
      });
    }

    // ✅ Save recommendation in student document
    student.pendingGraceRecommendation = {
      marks: Number(marks),
      reason: reason || "Recommended by coordinator",
      recommendedBy: req.user._id,
      status: "pending",
      date: new Date(),
    };
    await student.save();

    // ✅ Log recommendation in coordinator record
    await Coordinator.findByIdAndUpdate(req.user._id, {
      $push: {
        graceRecommendations: {
          student: studentId,
          marks: Number(marks),
          reason: reason || "",
          date: new Date(),
          status: "pending",
        },
      },
    });

    res.json({
      success: true,
      message: "Grace mark recommendation submitted successfully",
      student,
    });
  } catch (error) {
    console.error("Grace mark recommendation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// pdf genrateion for the coordinator
// export const generateEventReport = async (req, res) => {
//   try {
//     const { eventId } = req.params;

//     const coordinator = await Coordinator.findById(req.user._id);
//     if (!coordinator) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     const event = await Event.findById(eventId)
//       .populate("assignedTeacher", "name")
//       .populate("assignedCoordinators", "name")
//       .populate("participants", "name department");

//     if (!event) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Event not found" });
//     }

//     // ensure coordinator can only generate reports for events in their institution
//     if (String(event.institution) !== String(coordinator.institution)) {
//       return res
//         .status(403)
//         .json({
//           success: false,
//           message:
//             "Cannot generate report for an event outside your institution",
//         });
//     }

//     // Normalize data (make sure they are arrays)
//     const assignedCoordinators = Array.isArray(event.assignedCoordinators)
//       ? event.assignedCoordinators
//       : event.assignedCoordinators
//       ? [event.assignedCoordinators]
//       : [];

//     const assignedTeachers = Array.isArray(event.assignedTeacher)
//       ? event.assignedTeacher
//       : event.assignedTeacher
//       ? [event.assignedTeacher]
//       : [];

//     const participants = Array.isArray(event.participants)
//       ? event.participants
//       : event.participants
//       ? [event.participants]
//       : [];

//     // Ensure folder exists
//     const uploadsDir = path.join("uploads");
//     if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

//     const fileName = `event_report_${event._id}.pdf`;
//     const filePath = path.join(uploadsDir, fileName);

//     const doc = new PDFDocument({ margin: 40 });
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     // Header
//     doc.fontSize(20).text("Event Report", { align: "center", underline: true });
//     doc.moveDown(1.5);

//     // Section: Basic Event Info
//     doc.fontSize(12).text("Event Details", { underline: true });
//     doc.moveDown(0.5);

//     const tableLeftX = 60;
//     const valueLeftX = 200;
//     const rowHeight = 20;

//     const drawRow = (label, value, yOffset) => {
//       doc.font("Helvetica-Bold").text(`${label}:`, tableLeftX, yOffset);
//       doc.font("Helvetica").text(value || "N/A", valueLeftX, yOffset);
//     };

//     let currentY = doc.y;
//     drawRow("Title", event.title, currentY);
//     drawRow(
//       "Date",
//       new Date(event.date).toLocaleDateString(),
//       currentY + rowHeight
//     );
//     drawRow("Location", event.location, currentY + 2 * rowHeight);
//     drawRow("Hours", event.hours.toString(), currentY + 3 * rowHeight);
//     drawRow("Status", event.status || "Upcoming", currentY + 4 * rowHeight);

//     currentY += 5 * rowHeight + 10;
//     doc.moveDown();

//     // Coordinators and Teachers
//     doc.fontSize(12).text("Team Details", { underline: true });
//     currentY = doc.y + 5;

//     const coordinators =
//       assignedCoordinators.map((c) => c.name).join(", ") || "N/A";
//     const teachers = assignedTeachers.map((t) => t.name).join(", ") || "N/A";

//     drawRow("Coordinators", coordinators, currentY);
//     drawRow("Teachers", teachers, currentY + rowHeight);

//     doc.moveDown(2);

//     // Participants Table
//     doc.fontSize(12).text("Volunteers", { underline: true });
//     doc.moveDown(0.5);

//     const startY = doc.y + 5;
//     const col1 = 60; // #
//     const col2 = 100; // Name
//     const col3 = 300; // Department

//     // Table header
//     doc
//       .font("Helvetica-Bold")
//       .text("No.", col1, startY)
//       .text("Name", col2, startY)
//       .text("Department", col3, startY);

//     doc
//       .moveTo(60, startY + 15)
//       .lineTo(500, startY + 15)
//       .stroke();

//     // Table rows
//     doc.font("Helvetica");
//     let y = startY + 25;
//     if (participants.length > 0) {
//       participants.forEach((p, i) => {
//         doc
//           .text(i + 1, col1, y)
//           .text(p.name || "N/A", col2, y)
//           .text(p.department || "N/A", col3, y);
//         y += 20;
//       });
//     } else {
//       doc.text("No participants recorded.", col2, y);
//       y += 20;
//     }

//     // Total count
//     doc.moveDown(1.5);
//     doc
//       .font("Helvetica-Bold")
//       .text(`Total Volunteers: ${participants.length}`, { align: "right" });

//     // Finalize and download
//     doc.end();

//     stream.on("finish", () => {
//       res.download(filePath, fileName, (err) => {
//         if (err) console.error("File download error:", err);
//         fs.unlink(filePath, () => {}); // Delete file after sending
//       });
//     });
//   } catch (err) {
//     console.error("PDF Generation Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message || "Internal Server Error during PDF generation",
//     });
//   }
// };

export const generateEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 🔐 Auth check
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // 📦 Fetch event
    const event = await Event.findById(eventId)
      .populate("assignedTeacher", "name")
      .populate("assignedCoordinators", "name")
      .populate("participants", "name department");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // 🏫 Ensure event belongs to coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "Cannot generate report for an event outside your institution",
      });
    }

    // 🧩 Normalize data arrays
    const assignedCoordinators = Array.isArray(event.assignedCoordinators)
      ? event.assignedCoordinators
      : event.assignedCoordinators
      ? [event.assignedCoordinators]
      : [];

    const assignedTeachers = Array.isArray(event.assignedTeacher)
      ? event.assignedTeacher
      : event.assignedTeacher
      ? [event.assignedTeacher]
      : [];

    const participants = Array.isArray(event.participants)
      ? event.participants
      : event.participants
      ? [event.participants]
      : [];

    // 🧠 Generate AI summary
    let aiSummary = "";
    try {
      const input = `
        Event Title: ${event.title}
        Description: ${event.description || "No description provided."}
        Location: ${event.location}
        Duration: ${event.hours} hours
        Coordinators: ${
          assignedCoordinators.map((c) => c.name).join(", ") ||
          "NSS Coordinators"
        }
        Teachers: ${
          assignedTeachers.map((t) => t.name).join(", ") || "Teachers"
        }
        Participants: ${
          participants.map((p) => p.name).join(", ") || "Volunteers"
        }
        Generate a short, professional summary for this NSS event.
      `;

      const summaryRes = await hf.summarization({
        model: "facebook/bart-large-cnn",
        inputs: input,
        parameters: { max_length: 200, min_length: 60 },
      });

      aiSummary =
        summaryRes?.summary_text ||
        summaryRes?.[0]?.summary_text ||
        "Summary could not be generated.";
    } catch (aiErr) {
      console.error("AI Summary Generation Error:", aiErr);
      aiSummary = "AI summary unavailable due to inference issue.";
    }

    // 📁 Ensure folder exists
    const uploadsDir = path.join("uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    // 🧾 PDF setup
    const fileName = `event_report_${event._id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // -----------------------------
    // 🏷️ HEADER
    // -----------------------------
    doc.fontSize(20).text("Event Report", { align: "center", underline: true });
    doc.moveDown(1.5);

    // 📄 EVENT DETAILS
    doc.fontSize(12).text("Event Details", { underline: true });
    doc.moveDown(0.5);

    const tableLeftX = 60;
    const valueLeftX = 200;
    const rowHeight = 20;
    const drawRow = (label, value, yOffset) => {
      doc.font("Helvetica-Bold").text(`${label}:`, tableLeftX, yOffset);
      doc.font("Helvetica").text(value || "N/A", valueLeftX, yOffset);
    };

    let currentY = doc.y;
    drawRow("Title", event.title, currentY);
    drawRow(
      "Date",
      new Date(event.date).toLocaleDateString(),
      currentY + rowHeight
    );
    drawRow("Location", event.location, currentY + 2 * rowHeight);
    drawRow(
      "Hours",
      event.hours?.toString() || "N/A",
      currentY + 3 * rowHeight
    );
    drawRow("Status", event.status || "Upcoming", currentY + 4 * rowHeight);

    currentY += 5 * rowHeight + 10;
    doc.moveDown();

    // 👥 TEAM DETAILS
    doc.fontSize(12).text("Team Details", { underline: true });
    currentY = doc.y + 5;

    const coordinators =
      assignedCoordinators.map((c) => c.name).join(", ") || "N/A";
    const teachers = assignedTeachers.map((t) => t.name).join(", ") || "N/A";

    drawRow("Coordinators", coordinators, currentY);
    drawRow("Teachers", teachers, currentY + rowHeight);
    doc.moveDown(2);

    // 🧠 AI SUMMARY
    doc.fontSize(12).text("AI Generated Summary", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica").text(aiSummary, { align: "justify" });
    doc.moveDown(1.5);

    // 🧑‍🤝‍🧑 VOLUNTEERS TABLE
    doc.fontSize(12).text("Volunteers", { underline: true });
    doc.moveDown(0.5);

    const startY = doc.y + 5;
    const col1 = 60,
      col2 = 100,
      col3 = 300;

    doc
      .font("Helvetica-Bold")
      .text("No.", col1, startY)
      .text("Name", col2, startY)
      .text("Department", col3, startY);
    doc
      .moveTo(60, startY + 15)
      .lineTo(500, startY + 15)
      .stroke();

    doc.font("Helvetica");
    let y = startY + 25;

    if (participants.length > 0) {
      participants.forEach((p, i) => {
        doc
          .text(i + 1, col1, y)
          .text(p.name || "N/A", col2, y)
          .text(p.department || "N/A", col3, y);
        y += 20;
      });
    } else {
      doc.text("No participants recorded.", col2, y);
      y += 20;
    }

    // ➕ TOTAL VOLUNTEERS
    doc.moveDown(1.5);
    doc
      .font("Helvetica-Bold")
      .text(`Total Volunteers: ${participants.length}`, { align: "right" });

    // 🏁 END PDF
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) console.error("File download error:", err);
        fs.unlink(filePath, () => {}); // cleanup
      });
    });
  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error during PDF generation",
    });
  }
}; 
// update event status (simple version)
export const updateEventStatus = async (req, res) => {
  try {
    const { eventId, status } = req.body;

    if (!eventId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID and status are required" });
    }

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Ensure event belongs to coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "Cannot update an event outside your institution",
      });
    }

    event.status = status;
    await event.save();

    res.json({
      success: true,
      message: `Event status updated to ${status}`,
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

////////////ADMIN DASHBOARD WORK/////////////
export const getAllPendingCoordinator = async (req, res) => {
  try {
    const pendingCoordinator = await Coordinator.find({
      status: "pending",
    }).select("-password -otp -otpExpiry");
    res.json({
      success: true,
      count: pendingCoordinator.length,
      coordinator: pendingCoordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// approve coordinator
export const approveCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinator = await Coordinator.findById(id);
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinator Not Found" });
    }

    if (coordinator.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "Student Already" });
    }

    coordinator.status = "active";
    await coordinator.save();
    res.json({
      success: true,
      message: `${coordinator.name} has been approved successfully`,
      coordinator: await coordinator.populate("institution", "name address"),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// reject
export const rejectCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinator = await Coordinator.findById(id);
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Student Not Found" });
    }

    if (coordinator.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "Student Already active" });
    }
    coordinator.status = "rejected";
    if (coordinator.profileImage?.public_id) {
      await cloudinary.uploader.destroy(coordinator.profileImage.public_id);
    }

    await coordinator.save();
    res.json({
      success: true,
      message: `${coordinator.name} has been rejected successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCoordinators = async (req, res) => {
  try {
    const coordinator = await Coordinator.find()
      .populate("institution", "name address contactEmail")
      .select("-password -otp -otpExpiry") // don’t return sensitive data
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coordinator.length,
      coordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectInDashboardCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!coordinator)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.json({
      success: true,
      message: "Student rejected successfully",
      coordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== COORDINATOR DASHBOARD =====================
export const getCoordinatorDashboard = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user.id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const institutionId = coordinator.institution;

    // Events in this institution
    const totalAllEvents = await Event.countDocuments({
      institution: institutionId,
    });
    const completedAllEvents = await Event.countDocuments({
      institution: institutionId,
      status: "Completed",
    });
    const upcomingAllEvents = await Event.countDocuments({
      institution: institutionId,
      status: "Upcoming",
    });

    // Events assigned to this coordinator (within institution)
    const totalMyEvents = await Event.countDocuments({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
    });
    const completedMyEvents = await Event.countDocuments({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
      status: "Completed",
    });
    const upcomingMyEvents = await Event.countDocuments({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
      status: "Upcoming",
    });

    // Students / Volunteers / Teachers in this institution
    const totalStudents = await Student.countDocuments({
      institution: institutionId,
    });
    const totalVolunteers = await Student.countDocuments({
      institution: institutionId,
      role: "volunteer",
    });
    const totalTeachers = await Teacher.countDocuments({
      institution: institutionId,
    });

    // Grace marks recommended for events/coordinator within institution (approx)
    const totalGraceRecommendations = await Event.aggregate([
      { $match: { institution: institutionId } },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $size: { $ifNull: ["$recommendedGraceMarks", []] } },
          },
        },
      },
    ]);

    // Recent events for institution and coordinator
    const recentAllEvents = await Event.find({ institution: institutionId })
      .sort({ date: -1 })
      .limit(5)
      .select("title date status");

    const recentMyEvents = await Event.find({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
    })
      .sort({ date: -1 })
      .limit(5)
      .select("title date status");

    res.json({
      success: true,
      data: {
        allEvents: {
          totalEvents: totalAllEvents,
          completedEvents: completedAllEvents,
          upcomingEvents: upcomingAllEvents,
          recentEvents: recentAllEvents,
        },
        myEvents: {
          totalEvents: totalMyEvents,
          completedEvents: completedMyEvents,
          upcomingEvents: upcomingMyEvents,
          recentEvents: recentMyEvents,
        },
        totalStudents,
        totalVolunteers,
        totalTeachers,
        totalGraceRecommendations: totalGraceRecommendations[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching coordinator dashboard",
      error: error.message,
    });
  }
};

// coordinator profile
export const getCoordinatorProfile = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id)
      .populate("institution", "name _id") // populate institution details
      .select("-password"); // exclude password for safety

    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinator not found" });
    }

    res.json({
      success: true,
      coordinator: {
        _id: coordinator._id,
        name: coordinator.name,
        email: coordinator.email,
        institutionId: coordinator.institution?._id,
        institutionName: coordinator.institution?.name,
        role: coordinator.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coordinator profile",
    });
  }
};

// manage student (get students from the institute)
export const getAllStudentsByCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const institutionId = coordinator.institution;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Coordinator not assigned to any institution",
      });
    }

    const students = await Student.find({ institution: institutionId })
      .select("name email department role status talents") // only public fields
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const student = await Student.findOne({
      _id: id,
      institution: coordinator.institution,
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your institution",
      });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudentByCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, status } = req.body;

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const student = await Student.findOneAndUpdate(
      { _id: id, institution: coordinator.institution },
      { department, status },
      { new: true }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your institution",
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all events created/managed by the logged-in coordinator
export const getMyEvents = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const myEvents = await Event.find({
      assignedCoordinators: coordinator._id, // events where this coordinator is assigned
      institution: coordinator.institution, // within same institution
    })
      .populate("participants", "name department role")
      .populate("assignedTeacher", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: myEvents.length,
      events: myEvents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit / Update an event created by the coordinator
export const editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, location, date, hours, status } = req.body;

    // find coordinator
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // ensure the event belongs to this coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit events outside your institution",
      });
    }

    // update image if new one uploaded
    let updatedImage = event.images;
    if (req.file) {
      // delete old one (optional)
      if (event.images?.[0]?.public_id) {
        await cloudinary.uploader.destroy(event.images[0].public_id);
      }

      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "event_images",
      });
      updatedImage = [
        {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          caption: req.body.caption || "",
        },
      ];
    }

    // update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.date = date || event.date;
    event.hours = hours || event.hours;
    event.status = status || event.status;
    event.images = updatedImage;

    await event.save();

    res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignTeacherToEvent = async (req, res) => {
  try {
    const { eventId, teacherIds } = req.body;

    if (!eventId || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "eventId and teacherIds are required",
      });
    }

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "Cannot assign teachers outside your institution",
      });
    }

    const teacher = await Teacher.findOne({
      _id: teacherIds[0],
      institution: coordinator.institution,
    });

    if (!teacher)
      return res.status(404).json({
        success: false,
        message: "Teacher not found in your institution",
      });

    event.assignedTeacher = teacher._id;
    await event.save();

    await Teacher.findByIdAndUpdate(teacher._id, {
      $addToSet: { assignedEvents: event._id },
    });

    const updatedEvent = await Event.findById(eventId)
      .populate("assignedTeacher", "name email department")
      .populate("assignedCoordinators", "name email");

    res.json({
      success: true,
      message: "Teacher assigned successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Assign Teacher Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 1️⃣ Get All Events by Coordinator’s Institution
export const getAllEventsByCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);

    if (!coordinator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const events = await Event.find({
      institution: coordinator.institution,
    })
      .populate("assignedTeacher", "name email department")
      .populate("assignedCoordinators", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2️⃣ Get All Teachers in Coordinator’s Institution
export const getAllTeachersByCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);

    if (!coordinator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const teachers = await Teacher.find({
      institution: coordinator.institution,
      status: "active",
    }).select("name email department");

    res.json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/coordinator/unassign-teacher
export const unassignTeacherFromEvent = async (req, res) => {
  try {
    const { eventId, teacherId } = req.body;
    if (!eventId || !teacherId) {
      return res
        .status(400)
        .json({ message: "eventId and teacherId required" });
    }

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { assignedTeacher: teacherId } },
      { new: true }
    ).populate("assignedTeacher", "name email department");

    await Teacher.findByIdAndUpdate(teacherId, {
      $pull: { assignedEvents: eventId },
    });

    res.json({
      success: true,
      message: "Teacher unassigned successfully",
      event,
    });
  } catch (error) {
    console.error("Unassign Teacher Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unassign volunteer(s) from an event
export const unassignVolunteerFromEvent = async (req, res) => {
  try {
    const { eventId, volunteerIds } = req.body;
    if (!eventId || !Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "eventId and volunteerIds are required",
      });
    }

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Ensure the event belongs to the coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot unassign volunteers from another institution's event",
      });
    }

    // Ensure the volunteers are valid and belong to the same institution
    const volunteers = await Student.find({
      _id: { $in: volunteerIds },
      role: "volunteer",
      institution: coordinator.institution,
    });

    if (!volunteers.length) {
      return res.status(400).json({
        success: false,
        message: "No valid volunteers found in your institution",
      });
    }

    // Remove volunteers from event participants
    await Event.findByIdAndUpdate(
      eventId,
      { $pull: { participants: { $in: volunteerIds } } },
      { new: true }
    );

    // Remove event from volunteers' assignedEvents
    await Student.updateMany(
      { _id: { $in: volunteerIds } },
      { $pull: { assignedEvents: eventId } }
    );

    const updatedEvent = await Event.findById(eventId).populate(
      "participants",
      "name email department role"
    );

    res.json({
      success: true,
      message: "Volunteers unassigned successfully",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all volunteers under the coordinator's institution
export const getAllVolunteers = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const volunteers = await Student.find({
      institution: coordinator.institution,
      role: "volunteer",
      status: "active",
    }).select("name email department phone");

    res.json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    const { name, email, phoneNumber, department, password, institutionId } =
      req.body;
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

// approve coordinator
// export const approveCoordinator = async (req, res) => {
//   try {
//     const { coordinatorId } = req.body;
//     const coordinator = await Coordinator.findById(coordinatorId);
//     if (!coordinator) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Coordinator Not found" });
//     }
//     coordinator.status = "active";
//     await coordinator.save();
//     res.json({ success: true, message: "Coordinator has been approved" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

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
    const { title, description, location, date, hours,institutionId } = req.body;
    if (!title || !description || !location || !date || !hours||!institutionId) {
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
      institution:institutionId,
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

// assign voulnteer to event
export const assignVoulnteerToEvent = async (req, res) => {
  try {
    const { eventId, volunteerIds } = req.body;
    if (!eventId || !Array.isArray(volunteerIds) || volunteerIds.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "eventId and volunteerIds required" });

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // ensure the provided id is voulunteer
    const volunteer = await Student.find({
      _id: { $in: volunteerIds },
      role: "volunteer",
      status: "active",
    });
    if (!volunteer.length) {
      return res
        .status(400)
        .json({ success: false, message: "No volunteer found" });
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
export const recommendedGraceMark = async (req, res) => {
  try {
    const { studentId, marks, reason } = req.body;
    if (!studentId || typeof marks === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "studentId and marks required" });
    }
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    student.pendingGraceRecommendation = {
      marks: Number(marks),
      reason: reason || "",
      recommendedBy: req.user._id,
      status: "pending",
    };
    await student.save();

    await Coordinator.findByIdAndUpdate(req.user._id, {
      $push: {
        graceRecommendations: {
          student: studentId,
          marks: Number(marks),
          reason: reason || "",
        },
      },
    });

    res.json({
      success: true,
      message: "Grace mark recommendation submitted",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// pdf genrateion for the coordinator
export const generateEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("assignedTeacher", "name")
      .populate("assignedCoordinators", "name")
      .populate("participants", "name department");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Normalize data (make sure they are arrays)
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

    // Ensure folder exists
    const uploadsDir = path.join("uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const fileName = `event_report_${event._id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("Event Report", { align: "center", underline: true });
    doc.moveDown(1.5);

    // Section: Basic Event Info
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
    drawRow("Hours", event.hours.toString(), currentY + 3 * rowHeight);
    drawRow("Status", event.status || "Upcoming", currentY + 4 * rowHeight);

    currentY += 5 * rowHeight + 10;
    doc.moveDown();

    // Coordinators and Teachers
    doc.fontSize(12).text("Team Details", { underline: true });
    currentY = doc.y + 5;

    const coordinators =
      assignedCoordinators.map((c) => c.name).join(", ") || "N/A";
    const teachers = assignedTeachers.map((t) => t.name).join(", ") || "N/A";

    drawRow("Coordinators", coordinators, currentY);
    drawRow("Teachers", teachers, currentY + rowHeight);

    doc.moveDown(2);

    // Participants Table
    doc.fontSize(12).text("Volunteers", { underline: true });
    doc.moveDown(0.5);

    const startY = doc.y + 5;
    const col1 = 60; // #
    const col2 = 100; // Name
    const col3 = 300; // Department

    // Table header
    doc
      .font("Helvetica-Bold")
      .text("No.", col1, startY)
      .text("Name", col2, startY)
      .text("Department", col3, startY);

    doc
      .moveTo(60, startY + 15)
      .lineTo(500, startY + 15)
      .stroke();

    // Table rows
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

    // Total count
    doc.moveDown(1.5);
    doc
      .font("Helvetica-Bold")
      .text(`Total Volunteers: ${participants.length}`, { align: "right" });

    // Finalize and download
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) console.error("File download error:", err);
        fs.unlink(filePath, () => {}); // Delete file after sending
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

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
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
    const coordinatorId = req.user.id;

    // 1️ All events in the system
    const totalAllEvents = await Event.countDocuments();
    const completedAllEvents = await Event.countDocuments({
      status: "Completed",
    });
    const upcomingAllEvents = await Event.countDocuments({
      status: "Upcoming",
    });

    // 2️ Events created by this coordinator
    const totalMyEvents = await Event.countDocuments({
      coordinator: coordinatorId,
    });
    const completedMyEvents = await Event.countDocuments({
      coordinator: coordinatorId,
      status: "Completed",
    });
    const upcomingMyEvents = await Event.countDocuments({
      coordinator: coordinatorId,
      status: "Upcoming",
    });

    // 3️ Community stats
    const totalStudents = await Student.countDocuments();
    const totalVolunteers = await Student.countDocuments({ role: "volunteer" });
    const totalTeachers = await Teacher.countDocuments({ role: "teacher" });

    // 4️ Grace marks
    const totalGraceRecommendations = await Event.aggregate([
      { $match: { coordinator: coordinatorId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$recommendedGraceMarks" } },
        },
      },
    ]);

    // 5️ Recent events
    const recentAllEvents = await Event.find()
      .sort({ date: -1 })
      .limit(5)
      .select("title date status");

    const recentMyEvents = await Event.find({ coordinator: coordinatorId })
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

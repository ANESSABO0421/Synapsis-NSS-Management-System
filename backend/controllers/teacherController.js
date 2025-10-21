import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Teacher from "../models/Teacher.js";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import Student from "../models/Student.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Event from "../models/Event.js";
import Institution from "../models/Institution.js";

const generateToken = (id) =>
  jwt.sign({ id, role: "teacher" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// signup
export const teacherSignUp = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, password, institutionId } =
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
          "Password must be 8+ chars, include uppercase, lowercase, number, and special character",
      });
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    let profileImage = { url: "", public_id: "" };
    let verificationDocument = { url: "", public_id: "" };

    if (req.files?.profileImage?.[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.profileImage[0].path,
        { folder: "teacher_profiles" }
      );
      profileImage = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

    if (req.files?.verificationDocument?.[0]) {
      const uploaded = await cloudinary.uploader.upload(
        req.files.verificationDocument[0].path,
        { folder: "teacher_verify_documents" }
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

    const teacher = await Teacher.create({
      name,
      email,
      phoneNumber,
      department,
      password: hashed,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      profileImage,
      institution: institutionId,
      verificationDocument,
      status: "pending", // waiting for admin approval
      verifiedByAdmin: false,
    });

    await Institution.findByIdAndUpdate(institutionId, {
      $push: { teacher: teacher._id },
    });

    // otp
    await sendEmail(email, "Verify your Teacher account", `Your OTP is ${otp}`);

    return res.status(201).json({
      success: true,
      message:
        "Signup successful! Verify OTP sent to your email. Wait for admin approval after verification.",
      userId: teacher._id,
      role: "teacher",
    });
  } catch (error) {
    console.error("Error in teacher signup:", error);
    return res
      .status(500)
      .json({ success: false, message: "Signup failed: " + error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { teacherId, otp } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    if (teacher.otp !== Number(otp) || teacher.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    teacher.otp = null;
    teacher.otpExpiry = null;
    await teacher.save();
    res.json({
      success: true,
      message: "OTP verified. Now wait for admin approval",
      teacher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "teacher not found" });
    }
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) {
      return req
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    if (teacher.status !== "active") {
      return res.status(403).json({ message: "Account not active" });
    }
    const token = generateToken(teacher._id);

    res.json({ success: true, message: "Login succssfully", token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// admin operation

// // approve teacher
// export const approveTeacher = async (req, res) => {
//   try {
//     const teacher = await Teacher.findById(req.params.id);
//     if (!teacher) {
//       return res
//         .status(404)
//         .json({ success: false, message: "teacher not found" });
//     }
//     teacher.status = "active";
//     await teacher.save();
//     res.json({ success: true, message: "Teacher approved successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// assign teacher to event
export const assignTeacherToEvent = async (req, res) => {
  try {
    const { teacherId, eventId } = req.body;
    const teacher = await Teacher.findById(teacherId);
    const event = await Event.findById(eventId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    if (!event) {
      return res
        .status(404)
        .json({ success: true, message: "Event not found" });
    }

    if (!teacher.assignedEvents.includes(eventId))
      teacher.assignedEvents.push(eventId);

    if (!event.assignedTeacher.includes(teacherId))
      event.assignedTeacher.push(teacherId);

    await teacher.save();
    await event.save();

    res.json({ success: true, message: "Teacher is assigned to event" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// attendance
export const markAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendanceList } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event Not found" });
    }

    attendanceList.forEach(({ studentId, status }) => {
      const record = event.attendance.find(
        (a) => a.student.toString() === studentId
      );
      if (record) {
        record.status = status;
        record.markedAt = new Date();
      } else {
        event.attendance.push({
          student: studentId,
          status,
          markedBy: req.user?._id,
        });
      }
    });

    await event.save();
    res.json({
      success: true,
      message: "Attendance updated",
      attendance: event.attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// genarate attendance pdf
export const genrateAttendncePdfs = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate(
      // inside events attendance arrays inside student only take name department graceMarks
      "attendance.student",
      "name department graceMarks"
    );
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const doc = new PDFDocument({ margin: 40 });
    const fileName = `attandance_${event._id}.pdf`;
    const filePath = path.join("uploads", fileName);

    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .fontSize(20)
      .text(`Attendance Report - ${event.title}`, { align: "center" });

    doc.moveDown();
    doc.fontSize(12).text(`Date:${new Date(event.date).toLocaleDateString()}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Hours: ${event.hours}`);
    doc.moveDown();
    doc.text(
      "No.  Name                         Dept          Status      GraceMarks"
    );
    (event.attendance || []).forEach((a, i) => {
      const s = a.student || {};
      doc.text(
        `${i + 1}.     ${s.name || "-"}            ${
          s.department || "-"
        }              ${a.status}      ${s.graceMarks || 0}`
      );
    });
    doc.end();
    stream.on("finish", () => {
      res.download(filePath, fileName, () => fs.unlinkSync(filePath));
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// grace mark assigning
export const assignGraceMark = async (req, res) => {
  try {
    const { studentId, marks } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    student.graceMarks += Number(marks);
    await student.save();

    res.json({ success: true, message: "Grace marks assigned", student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// gracemark recommended by coordinator approve
export const approveRecommendedGraceMark = async (req, res) => {
  try {
    const { studentId, approve } = req.body;
    const student = await Student.findById(studentId).select("-password");
    if (!student || !student.pendingGraceRecommendation) {
      return res.status(404).json({
        success: false,
        message: "No pending grace mark recommendation found",
      });
    }
    if (approve) {
      student.graceMarks += student.pendingGraceRecommendation.marks;
      student.pendingGraceRecommendation.status = "approved";
    } else {
      student.pendingGraceRecommendation.status = "rejected";
    }

    await student.save();
    res.json({
      success: true,
      message: approve
        ? "Grace marks approved and added"
        : "Grace marks recommendation rejected",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/////////////////////////Admin dahboard(approval get and reject)///////////////////////////////////////////////

// get pending teachers
export const getAllPendingTeacher = async (req, res) => {
  try {
    const pendingTeachers = await Teacher.find({ status: "pending" }).select(
      "-password -otp -otpExpiry"
    );
    if (!pendingTeachers) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res.json({
      success: true,
      count: pendingTeachers.length,
      teachers: pendingTeachers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// approve teacher(admin)
export const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    teacher.status = "active";
    teacher.verifiedByAdmin = true;
    await teacher.save();
    res.json({
      success: true,
      message: "Teacher has been approved successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// reject teacher(admin)
export const rejectPendingTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    teacher.status = "rejected";
    if (teacher.profileImage?.public_id) {
      await cloudinary.uploader.destroy(teacher.profileImage.public_id);
    }
    teacher.verifiedByAdmin = false;
    await teacher.save();
    res.json({
      success: true,
      message: "Teacher has been Rejected successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTeacher = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select("-password -otp -otpExpiry") // don’t return sensitive data
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectInDashboardTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!teacher)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.json({
      success: true,
      message: "teacher rejected successfully",
      teacher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

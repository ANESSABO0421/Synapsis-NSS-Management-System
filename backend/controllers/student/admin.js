import Student from "../../models/Student.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../utils/cloudinary.js";

export const adminCreateStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, talents, password, institution } =
      req.body;

    if (!institution) {
      return res
        .status(400)
        .json({ success: false, message: "institution is required" });
    }

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
      institution,
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
    if (status && !["pending", "active", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

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
    const { studentId } = req.params;
    const eventId = String(req.event._id);

    const student = await Student.findById(studentId);
    const event = req.event;

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

export const getPendingStudent = async (req, res) => {
  try {
    const pendingStudents = await Student.find({ status: "pending" }).select(
      "-password -otp -otpExpiry"
    );

    res.json({
      success: true,
      count: pendingStudents.length,
      students: pendingStudents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// approve Student

export const approvePendingStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student Not Found" });
    }

    if (student.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "Student Already" });
    }

    student.status = "active";
    await student.save();
    res.json({
      success: true,
      message: `${student.name} has been approved successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// reject student

export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student Not Found" });
    }

    if (student.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "Student Already active" });
    }
    student.status = "rejected";
    if (student.profileImage?.public_id) {
      await cloudinary.uploader.destroy(student.profileImage.public_id);
    }

    await student.save();
    res.json({
      success: true,
      message: `${student.name} has been rejected successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students with their status

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password -otp -otpExpiry") // don’t return sensitive data
      .populate("institution", "name address")
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

export const rejectInDashboardStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.json({
      success: true,
      message: "Student rejected successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

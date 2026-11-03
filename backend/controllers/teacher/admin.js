import Teacher from "../../models/Teacher.js";
import cloudinary from "../../utils/cloudinary.js";
import Event from "../../models/Event.js";

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
// markAttendance moved to controllers/attendanceController.js (adds ownership + participant checks)

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

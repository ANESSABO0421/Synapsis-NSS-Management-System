import Teacher from "../../models/Teacher.js";
import cloudinary from "../../utils/cloudinary.js";
import Student from "../../models/Student.js";
import Event from "../../models/Event.js";

export const teacherOverview = async (req, res) => {
  try {
    const teacherId = req.user._id; // assuming added by JWT middleware
    const teacher = await Teacher.findById(teacherId).populate("institution");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const institutionId = teacher.institution?._id;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not linked to any institution",
      });
    }

    // 🔹 Fetch institution events
    const institutionEvents = await Event.find({ institution: institutionId });

    // 🔹 Fetch events assigned specifically to this teacher
    const assignedEvents = await Event.find({
      assignedTeacher: teacherId,
    }).sort({ createdAt: -1 });

    // 🔹 Event Stats
    const totalEvents = assignedEvents.length;
    const completedEvents = assignedEvents.filter(
      (e) => e.status?.toLowerCase() === "completed"
    ).length;
    const upcomingEvents = assignedEvents.filter(
      (e) => e.status?.toLowerCase() === "upcoming"
    ).length;

    // 🔹 Students under same institution
    const students = await Student.find({ institution: institutionId });
    const totalStudents = students.length;
    const volunteers = students.filter(
      (s) => s.role?.toLowerCase() === "volunteer"
    ).length;

    // 🔹 Grace Mark Recommendations
    // --- Grace Mark Recommendations ---
    // --- Grace Mark Recommendations ---
    const recommendations = students.filter((s) => {
      const rec = s.pendingGraceRecommendation;
      if (!rec || !rec.assignedTeachers || !Array.isArray(rec.assignedTeachers))
        return false;

      // check if teacher is in assignedTeachers array
      return rec.assignedTeachers.some(
        (t) => t.toString() === teacherId.toString()
      );
    });

    // total recommendation count for this teacher
    const totalRecommendations = recommendations.length;

    // status-based filtering
    const pendingRecommendations = recommendations.filter(
      (s) => s.pendingGraceRecommendation.status?.toLowerCase() === "pending"
    ).length;

    const approvedRecommendations = recommendations.filter(
      (s) => s.pendingGraceRecommendation.status?.toLowerCase() === "approved"
    ).length;

    const rejectedRecommendations = recommendations.filter(
      (s) => s.pendingGraceRecommendation.status?.toLowerCase() === "rejected"
    ).length;

    // 🔹 Grace marks given (approved)
    const graceMarksGiven = approvedRecommendations;

    // 🔹 Recent Events (limit 5)
    const recentEvents = assignedEvents.slice(0, 5).map((event) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      status: event.status,
      hours: event.hours,
      createdAt: event.createdAt,
    }));

    // 🔹 Prepare overview response
    const overview = {
      teacherName: teacher.name,
      institutionName: teacher.institution?.name || "N/A",
      totalStudents,
      volunteers,
      totalEvents,
      completedEvents,
      upcomingEvents,
      institutionEvents: institutionEvents.length,
      graceMarksGiven,
      graceMarkStats: {
        total: totalRecommendations,
        pending: pendingRecommendations,
        approved: approvedRecommendations,
        rejected: rejectedRecommendations,
      },
      recentEvents,
    };

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("❌ Error in teacherOverview:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// pending recomendtaion
// ✅ Get all pending grace mark recommendations assigned to a teacher

export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user._id; // ✅ from auth middleware

    const teacher = await Teacher.findById(teacherId).select(
      "-password -otp -otpExpiry -__v"
    );

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({
      success: true,
      message: "Teacher profile fetched successfully",
      teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ==============================
// 🟡 Update Teacher Profile
// ==============================

export const updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { name, email, phoneNumber, department } = req.body;

    const updateData = { name, email, phoneNumber, department };

    // ✅ If profile image is updated
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "teacher_profiles",
      });
      updateData.profileImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // ✅ Update teacher info
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true }
    ).select("-password -otp -otpExpiry -__v");

    if (!updatedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({
      success: true,
      message: "Teacher profile updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET participants of a specific event with event-wise grace marks

import Student from "../../models/Student.js";
import cloudinary from "../../utils/cloudinary.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id; // ✅ Extract from token (protect middleware)

    const student = await Student.findById(studentId)
      .populate({
        path: "institution",
        select: "name address type", // ✅ Include institution details
      })
      .populate({
        path: "assignedEvents",
        select: "title status hours date location description assignedTeacher",
        populate: {
          path: "assignedTeacher",
          select: "name email",
        },
      })
      .select("-password -otp -otpExpiry");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ✅ Calculate event stats
    const totalEvents = student.assignedEvents.length;
    const completedEvents = student.assignedEvents.filter(
      (e) => e.status === "Completed"
    ).length;

    const totalHours = student.assignedEvents.reduce(
      (sum, e) => sum + (e.hours || 0),
      0
    );

    // Grace marks come from the graceHistory ledger (see Student pre-save hook);
    // the dashboard must not overwrite them.
    const graceMarks = student.graceMarks || 0;

    // ✅ Awards (if totalHours crosses milestones)
    let autoAwards = [];
    if (totalHours >= 50) autoAwards.push("Bronze NSS Volunteer");
    if (totalHours >= 100) autoAwards.push("Silver NSS Volunteer");
    if (totalHours >= 200) autoAwards.push("Gold NSS Volunteer");

    // Merge manual + auto awards
    const awards = [
      ...(student.awards || []),
      ...autoAwards.map((title) => ({ name: title })),
    ];

    // ✅ Final dashboard response
    res.json({
      success: true,
      dashboard: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          phoneNumber: student.phoneNumber,
          department: student.department,
          talents: student.talents,
          profileImage: student.profileImage?.url || null,
          institution: student.institution
            ? {
                name: student.institution.name,
                address: student.institution.address,
              }
            : null,
        },
        stats: {
          totalEvents,
          completedEvents,
          totalHours,
          graceMarks,
        },
        awards,
        assignedEvents: student.assignedEvents.map((ev) => ({
          id: ev._id,
          title: ev.title,
          description: ev.description,
          status: ev.status,
          hours: ev.hours,
          date: ev.date,
          location: ev.location,
          teacher:
            ev.assignedTeacher && ev.assignedTeacher.length
              ? ev.assignedTeacher.map((t) => t.name).join(", ")
              : "N/A",
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// profile

export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // 🟢 Extracted from token

    const student = await Student.findById(studentId)
      .select("-password -otp -otpExpiry")
      .populate("institution", "name address");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// edit
// Edit Student Profile

export const editStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // ✅ Extracted from JWT token
    const { name, phoneNumber, department, talents } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // ✅ Update fields only if provided
    if (name) student.name = name;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (department) student.department = department;
    if (talents) {
      student.talents = Array.isArray(talents) ? talents : [talents];
    }

    // ✅ Profile image update
    if (req.file) {
      // Delete old image from cloudinary if exists
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
      message: "Profile updated successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        department: student.department,
        talents: student.talents,
        profileImage: student.profileImage?.url || null,
        institution: student.institution,
      },
    });
  } catch (error) {
    console.error("Profile Edit Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/studentController.js

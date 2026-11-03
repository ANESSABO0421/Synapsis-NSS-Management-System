import Coordinator from "../../models/Coordinator.js";
import Event from "../../models/Event.js";
import Student from "../../models/Student.js";

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

export const recommendedGraceMark = async (req, res) => {
  try {
    const { studentId, marks, reason } = req.body;

    if (!studentId || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: "Student ID and marks are required",
      });
    }

    const numericMarks = Number(marks);
    if (!Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a number between 0 and 100",
      });
    }

    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Coordinator not found",
      });
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

    if (student.role !== "volunteer") {
      return res.status(400).json({
        success: false,
        message: "This student is not an NSS volunteer",
      });
    }

    // 🚫 Prevent recommending again if a pending recommendation exists
    if (
      student.pendingGraceRecommendation &&
      student.pendingGraceRecommendation.status === "pending"
    ) {
      return res.status(400).json({
        success: false,
        message: "This student already has a pending grace mark recommendation",
      });
    }

    // --- Find completed events for the student
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

    // --- Collect assigned teachers
    const assignedTeacherIds = new Set();
    for (const event of completedEvents) {
      if (Array.isArray(event.assignedTeacher)) {
        event.assignedTeacher.forEach((t) =>
          assignedTeacherIds.add(t.toString())
        );
      } else if (event.assignedTeacher) {
        assignedTeacherIds.add(event.assignedTeacher.toString());
      }
    }

    const assignedTeachers = Array.from(assignedTeacherIds);

    // ✅ Store new recommendation
    student.pendingGraceRecommendation = {
      marks: Number(marks),
      reason: reason || "Recommended by coordinator",
      recommendedBy: req.user._id,
      assignedTeachers,
      status: "pending",
      date: new Date(),
    };

    student.markModified("pendingGraceRecommendation");
    await student.save();

    // ✅ Log in coordinator record (keep all history)
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

    res.status(200).json({
      success: true,
      message: "Grace mark recommendation submitted successfully",
      student: {
        id: student._id,
        name: student.name,
        pendingGraceRecommendation: student.pendingGraceRecommendation,
      },
      assignedTeachers,
    });
  } catch (error) {
    console.error("Grace mark recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

//     doc.moveDown(2);

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
      { new: true, runValidators: true }
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

import Teacher from "../../models/Teacher.js";
import Student from "../../models/Student.js";
import Coordinator from "../../models/Coordinator.js";

const MAX_GRACE_MARKS = 100;

// Shared checks for grace-mark writes. req.event is set by requireEventAccess.

const loadGraceTarget = async (req, res, studentId, marks, { requireMarks = true } = {}) => {
  if (requireMarks) {
    const n = Number(marks);
    if (!Number.isFinite(n) || n < 0 || n > MAX_GRACE_MARKS) {
      res.status(400).json({
        success: false,
        message: `Marks must be a number between 0 and ${MAX_GRACE_MARKS}`,
      });
      return null;
    }
  }
  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404).json({ success: false, message: "Student not found" });
    return null;
  }
  const participated = req.event.participants.some((p) => String(p) === String(student._id));
  if (!participated) {
    res.status(400).json({ success: false, message: "Student did not participate in this event" });
    return null;
  }
  return student;
};

export const assignGraceMark = async (req, res) => {
  try {
    const { studentId, eventId, marks } = req.body;

    const student = await loadGraceTarget(req, res, studentId, marks);
    if (!student) return;

    const exists = student.graceHistory.some(
      (h) => String(h.eventId) === String(eventId)
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Grace marks already assigned for this event",
      });
    }

    student.graceHistory.push({
      eventId,
      marks: Number(marks),
      date: new Date(),
    });

    await student.save(); // auto recalculates total

    res.json({ success: true, message: "Grace marks assigned", student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGraceMark = async (req, res) => {
  try {
    const { studentId, eventId } = req.params;
    const { marks } = req.body;

    const student = await loadGraceTarget(req, res, studentId, marks);
    if (!student) return;

    const record = student.graceHistory.find(
      (h) => String(h.eventId) === String(eventId)
    );

    if (!record)
      return res.status(404).json({
        success: false,
        message: "No grace marks found for this event",
      });

    record.marks = Number(marks);

    await student.save(); // auto recalculates

    res.json({ success: true, message: "Event grace mark updated", student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGraceMark = async (req, res) => {
  try {
    const { studentId, eventId } = req.params;

    const student = await loadGraceTarget(req, res, studentId, null, { requireMarks: false });
    if (!student) return;

    student.graceHistory = student.graceHistory.filter(
      (h) => String(h.eventId) !== String(eventId)
    );

    await student.save(); // auto recalculates

    res.json({
      success: true,
      message: "Grace mark removed for event",
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// gracemark recommended by coordinator approve
// ✅ Approve or reject a pending grace mark recommendation
// export const approveRecommendedGraceMark = async (req, res) => {
//   try {
//     const { studentId, approve } = req.body;

//       student.graceMarks += Number(marks);

export const approveRecommendedGraceMark = async (req, res) => {
  try {
    const { studentId, approve } = req.body;

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID required" });
    }

    const teacher = await Teacher.findById(req.user._id);
    if (!teacher) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized teacher" });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.pendingGraceRecommendation) {
      return res.status(404).json({
        success: false,
        message: "No pending grace mark recommendation found for this student",
      });
    }

    // Each recommendation can be decided exactly once.
    if (student.pendingGraceRecommendation.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `This recommendation was already ${student.pendingGraceRecommendation.status}`,
      });
    }

    if (
      !student.pendingGraceRecommendation.assignedTeachers.includes(
        req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to review this recommendation",
      });
    }

    // ✅ Update status & log review
    student.pendingGraceRecommendation.status = approve
      ? "approved"
      : "rejected";
    student.pendingGraceRecommendation.reviewedBy = req.user._id;
    student.pendingGraceRecommendation.reviewedDate = new Date();

    // Record the decision in the ledger; the Student pre-save hook derives
    // graceMarks from approved entries only.
    student.graceHistory.push({
      marks: student.pendingGraceRecommendation.marks,
      reason: student.pendingGraceRecommendation.reason,
      source: "recommendation",
      approvedBy: req.user._id,
      date: new Date(),
      status: approve ? "approved" : "rejected",
    });
    student.markModified("pendingGraceRecommendation");

    await student.save();

    // ✅ Update coordinator’s log
    await Coordinator.updateOne(
      {
        _id: student.pendingGraceRecommendation.recommendedBy,
        "graceRecommendations.student": student._id,
      },
      {
        $set: {
          "graceRecommendations.$.status": approve ? "approved" : "rejected",
        },
      }
    );

    // ⚠️ DO NOT remove pendingGraceRecommendation
    // Keep it for record/history, so coordinators can see status

    res.status(200).json({
      success: true,
      message: `Grace mark ${approve ? "approved" : "rejected"} successfully`,
      student,
    });
  } catch (error) {
    console.error("Approve grace mark error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

/////////////////////////Admin dahboard(approval get and reject)///////////////////////////////////////////////

// get pending teachers

export const getPendingRecommendations = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Find all students where this teacher is assigned in recommendation
    const students = await Student.find({
      "pendingGraceRecommendation.assignedTeachers": teacherId,
      "pendingGraceRecommendation.status": "pending",
    })
      .populate("pendingGraceRecommendation.recommendedBy", "name email")
      .select("name email department pendingGraceRecommendation");

    // Format the response
    const data = students.map((student) => ({
      id: student._id,
      name: student.name,
      email: student.email,
      department: student.department,
      marks: student.pendingGraceRecommendation.marks,
      reason: student.pendingGraceRecommendation.reason,
      recommendedBy:
        student.pendingGraceRecommendation.recommendedBy?.name || "N/A",
      status: student.pendingGraceRecommendation.status,
      date: student.pendingGraceRecommendation.date,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pending recommendations:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recommendations" });
  }
};

// get events assigned to teacher

import Coordinator from "../../models/Coordinator.js";
import Event from "../../models/Event.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import Notification from "../../models/Notification.js";

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

    for (const v of volunteer) {
      await Notification.create({
        user: v._id,
        userModel: "Student",
        institution: coordinator.institution,
        title: "Assigned as Volunteer",
        message: `You have been selected as a volunteer for the event "${event.title}".`,
        event: event._id,
      });
    }

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

    await Notification.create({
      user: teacher._id,
      userModel: "Teacher",
      institution: coordinator.institution,
      title: "Assigned to Event",
      message: `You have been assigned as a teacher for the event "${event.title}".`,
      event: event._id,
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

    await Notification.create({
      user: teacherId,
      userModel: "Teacher",
      institution: coordinator.institution,
      title: "Removed from Event",
      message: `You have been unassigned from the event "${event.title}".`,
      event: eventId,
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

    for (const student of volunteers) {
      await Notification.create({
        user: student._id,
        userModel: "Student",
        institution: coordinator.institution,
        title: "Removed as Volunteer",
        message: `You have been unassigned as a volunteer from the event "${event.title}".`,
        event: eventId,
      });
    }

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

// coordinator profile section

// ===============================
// 📄 GET Coordinator Profile
// ===============================

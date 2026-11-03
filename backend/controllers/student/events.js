import Student from "../../models/Student.js";
import cloudinary from "../../utils/cloudinary.js";
import Event from "../../models/Event.js";
import fs from "fs";

export const getFilteredStudentEvents = async (req, res) => {
  try {
    const studentId = req.user?.id; // From JWT middleware
    const { status, teacherId, coordinatorId, startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Missing student ID in token",
      });
    }

    // ✅ Base query: find events where student is a participant
    const query = { participants: studentId };

    if (status) query.status = new RegExp(`^${status}$`, "i");
    if (teacherId) query.assignedTeacher = teacherId;
    if (coordinatorId) query.assignedCoordinators = coordinatorId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const events = await Event.find(query)
      .populate("assignedTeacher", "name email department phoneNumber")
      .populate("assignedCoordinators", "name email department phoneNumber")
      .populate("institution", "name address")
      .sort({ date: -1 });

    if (!events || events.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events found for this student",
        filters: { statuses: [], teachers: [], coordinators: [] },
        events: [],
      });
    }

    // ✅ Build dropdown filters safely
    const uniqueTeachers = new Map();
    const uniqueCoordinators = new Map();
    const statuses = new Set();

    events.forEach((e) => {
      if (e.status) statuses.add(e.status);

      // 🧑‍🏫 Assigned Teachers (handle both array and single)
      if (e.assignedTeacher) {
        const teachers = Array.isArray(e.assignedTeacher)
          ? e.assignedTeacher
          : [e.assignedTeacher];

        teachers.forEach((t) => {
          if (t?._id) {
            uniqueTeachers.set(String(t._id), {
              id: t._id,
              name: t.name,
              email: t.email,
              department: t.department || "N/A",
              phoneNumber: t.phoneNumber || "N/A",
            });
          }
        });
      }

      // 👨‍🏫 Assigned Coordinators (handle both array and single)
      if (e.assignedCoordinators) {
        const coordinators = Array.isArray(e.assignedCoordinators)
          ? e.assignedCoordinators
          : [e.assignedCoordinators];

        coordinators.forEach((c) => {
          if (c?._id) {
            uniqueCoordinators.set(String(c._id), {
              id: c._id,
              name: c.name,
              email: c.email,
              department: c.department || "N/A",
              phoneNumber: c.phoneNumber || "N/A",
            });
          }
        });
      }
    });

    const dropdownData = {
      statuses: Array.from(statuses),
      teachers: Array.from(uniqueTeachers.values()),
      coordinators: Array.from(uniqueCoordinators.values()),
    };

    // ✅ Format final events
    const formattedEvents = events.map((ev) => ({
      id: ev._id,
      title: ev.title,
      description: ev.description,
      date: ev.date,
      status: ev.status,
      hours: ev.hours,
      location: ev.location,
      teacher: Array.isArray(ev.assignedTeacher)
        ? ev.assignedTeacher.map((t) => ({
            id: t._id,
            name: t.name,
            email: t.email,
            department: t.department || "N/A",
            phoneNumber: t.phoneNumber || "N/A",
          }))
        : ev.assignedTeacher
        ? {
            id: ev.assignedTeacher._id,
            name: ev.assignedTeacher.name,
            email: ev.assignedTeacher.email,
            department: ev.assignedTeacher.department || "N/A",
            phoneNumber: ev.assignedTeacher.phoneNumber || "N/A",
          }
        : null,
      coordinator: Array.isArray(ev.assignedCoordinators)
        ? ev.assignedCoordinators.map((c) => ({
            id: c._id,
            name: c.name,
            email: c.email,
            department: c.department || "N/A",
            phoneNumber: c.phoneNumber || "N/A",
          }))
        : ev.assignedCoordinators
        ? {
            id: ev.assignedCoordinators._id,
            name: ev.assignedCoordinators.name,
            email: ev.assignedCoordinators.email,
            department: ev.assignedCoordinators.department || "N/A",
            phoneNumber: ev.assignedCoordinators.phoneNumber || "N/A",
          }
        : null,
      institution: ev.institution
        ? {
            id: ev.institution._id,
            name: ev.institution.name,
            address: ev.institution.address,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Student events fetched successfully",
      filters: dropdownData,
      events: formattedEvents,
    });
  } catch (error) {
    console.error("❌ Get Filtered Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get event of student/volunteer

export const getMyEvents = async (req, res) => {
  try {
    const studentId = req.user._id; // from protect middleware
    const student = await Student.findById(studentId).populate(
      "assignedEvents"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // If no assigned events
    if (!student.assignedEvents || student.assignedEvents.length === 0) {
      return res.status(200).json({
        success: true,
        events: [],
        message: "No events assigned yet",
      });
    }

    // ✅ Fetch full event details
    // Check if "coordinator" exists in Event schema before populating
    const populateOptions = [
      { path: "institution", select: "name" }, // only if institution exists
    ];

    // If your Event schema actually includes coordinator, uncomment this:
    // populateOptions.push({ path: "coordinator", select: "name email" });

    const events = await Event.find({
      _id: { $in: student.assignedEvents },
    })
      .populate(populateOptions)
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("❌ Error fetching student events:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student events",
    });
  }
};

export const getStudentAttendanceForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id; // 🟢 from JWT middleware

    // 1️⃣ Find event and populate attendance
    const event = await Event.findById(eventId)
      .populate("attendance.student", "name department")
      .populate("attendance.markedBy", "name email");

    if (!event)
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });

    // 2️⃣ Find student attendance record
    const record = event.attendance.find(
      (a) => a.student._id.toString() === studentId.toString()
    );

    if (!record) {
      return res.status(200).json({
        success: true,
        message: "Attendance not marked yet for this student",
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
        },
        attendance: {
          status: "Not Marked",
          markedBy: null,
          date: null,
        },
      });
    }

    // 3️⃣ Return attendance info
    res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
      },
      attendance: {
        status: record.status,
        markedBy: record.markedBy
          ? {
              id: record.markedBy._id,
              name: record.markedBy.name,
              email: record.markedBy.email,
            }
          : null,
        date: record.date,
      },
    });
  } catch (error) {
    console.error("❌ Attendance Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// upload images

export const uploadEventImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions } = req.body; // optional captions array (can be stringified)

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        // ✅ Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "event_images",
        });

        // ✅ Push uploaded info
        uploadedImages.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          caption:
            Array.isArray(captions) && captions[i]
              ? captions[i]
              : typeof captions === "string"
              ? captions
              : "",
          uploadAt: new Date(),
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr.message);
      } finally {
        // ✅ Safely delete local temp file if it exists
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkErr) {
          console.warn("Local file cleanup skipped:", unlinkErr.message);
        }
      }
    }

    // ✅ Append to existing images (instead of replacing)
    event.images = [...(event.images || []), ...uploadedImages];
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("❌ Error uploading event images:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

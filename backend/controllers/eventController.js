import Alumni from "../models/Alumni.js";
import Event from "../models/Event.js";
import Student from "../models/Student.js";
import cloudinary from "../utils/cloudinary.js";
import { hoursForAttendance } from "../services/nssProgress.js";

// create events
export const createEvents = async (req, res) => {
  try {
    const { title, description, date, location, hours } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      location,
      hours,
      createdBy: req.admin._id,
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("participants", "name email");
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all events on the table
export const getAllevents = async (req, res) => {
  try {
    const events = await Event.find()
      .select("title description date location hours status images institution donationOpen")
      .sort({ date: -1 })
      .lean();
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEventsAlumniInstituition = async (req, res) => {
  try {
    const AlumniId = req.user.id;
    const Alum = await Alumni.findById(AlumniId);
    if (!Alum) {
      return res
        .status(404)
        .json({ success: false, message: "Alumni Not found" });
    }
    const instituitionId = Alum.institution;
    const InstitutionEvent = await Event.find({ institution: instituitionId });
    res.json({ success: true, events: InstitutionEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get events by id
export const getEventById = async (req, res) => {
  try {
    const events = await Event.findById(req.params.id).select("-attendance");
    if (!events) {
      return res
        .status(404)
        .json({ success: false, message: "event not found" });
    }
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = req.event;
    await Student.updateMany(
      { assignedEvents: event._id },
      { $pull: { assignedEvents: event._id } }
    );
    await event.deleteOne();
    res.json({ success: true, message: "event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// assigning student to an event by admin or super admin
export const assignStudentToEvent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const events = req.event;
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "student not found" });
    }
    if (String(student.institution) !== String(events.institution)) {
      return res.status(400).json({
        success: false,
        message: "Student belongs to a different institution",
      });
    }

    // adding students to participants
    if (!events.participants.includes(studentId)) {
      events.participants.push(studentId);
      await events.save();
    }

    // Also add event to student's  assignedEvents key it will update both modal of student and event if not already added
    if (!student.assignedEvents.includes(events._id)) {
      student.assignedEvents.push(events._id);
      await student.save();
    }

    res.json({
      success: true,
      message: "Student assigned to event successfully",
      events,
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update event section
export const updateEvent = async (req, res) => {
  try {
    const events = req.event;
    for (const field of ["title", "description", "date", "location", "hours"]) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        events[field] = req.body[field];
      }
    }

    await events.save();

    res.json({ success: true, message: "event updated", events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get event participants
export const getEventParticipants = async (req, res) => {
  try {
    const events = await req.event.populate("participants", "name email department");
    res.json({ success: true, participants: events.participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// upload images
export const uploadEventImages = async (req, res) => {
  try {
    const event = req.event;
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "no image has been uploaded" });
    }

    const uploadImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      caption: req.body.caption || "",
      uploadAt: new Date(),
    }));

    event.images.push(...uploadImages);
    await event.save();

    res.status(201).json({
      success: true,
      message: `${req.files.length} images has been uploaded`,
      images: event.images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventImages = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select("images");
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "no event found" });
    }
    res.json({ success: true, images: event.images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete image
export const deleteEventImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const events = req.event;
    const image = events.images.id(imageId);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "image is not found" });
    }

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    image.deleteOne();
    await events.save();
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all event images (show case on the main website)
export const getAllEventImages = async (req, res) => {
  try {
    const events = await Event.find({ "images.0": { $exists: true } }).select(
      "title date images"
    );
    // get all images to string in an single array of object using flatMap
    const getAllImages = events.flatMap((event) =>
      event.images.map((img) => ({
        ...img.toObject(),
        eventTitle: event.title,
        eventDate: event.date,
        eventId: event._id,
      }))
    );
    res.status(200).json({ success: true, images: getAllImages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete Event and update students' volunteer hours & awards
// Start Event
export const startEvent = async (req, res) => {
  try {
    const event = req.event;

    if (event.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message: "Only upcoming events can be started",
      });
    }

    // Mark event as ongoing and set startTime
    event.status = "Ongoing";
    event.startTime = new Date();

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event started successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Volunteer levels: [minimum hours, level]. Highest first.
const LEVELS = [
  [50, "Platinum"],
  [26, "Gold"],
  [11, "Silver"],
  [0, "Bronze"],
];
const levelFor = (hours) => LEVELS.find(([min]) => hours >= min)[1];

// Complete Event: credits hours to present students and awards level-ups once.
export const completeEvent = async (req, res) => {
  try {
    const event = req.event;

    if (event.status !== "Ongoing") {
      return res.status(400).json({
        success: false,
        message: "Only ongoing events can be completed",
      });
    }

    event.status = "Completed";
    event.endTime = new Date();

    const start = event.startTime || event.date;
    const hours = Math.max(0, Number(((event.endTime - start) / 3_600_000).toFixed(2)));
    event.calculatedHours = hours;

    // Each student is credited for the time they were actually present
    // (QR check-in/out), or the full duration when marked present manually.
    const earned = new Map();
    for (const att of event.attendance) {
      att.hours = hoursForAttendance(event, att);
      if (att.hours > 0) earned.set(String(att.student), att.hours);
    }
    const students = await Student.find({ _id: { $in: [...earned.keys()] } });

    for (const student of students) {
      student.totalVolunteerHours = Number(
        (student.totalVolunteerHours + earned.get(String(student._id))).toFixed(2)
      );
      const level = levelFor(student.totalVolunteerHours);
      student.level = level;
      // One award per level, ever — previously this pushed a duplicate every event.
      if (!student.awards.some((a) => a.title === `${level} Volunteer`)) {
        student.awards.push({
          title: `${level} Volunteer`,
          description: `Reached ${student.totalVolunteerHours} volunteer hours`,
        });
      }
      await student.save();
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event completed successfully and students updated",
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

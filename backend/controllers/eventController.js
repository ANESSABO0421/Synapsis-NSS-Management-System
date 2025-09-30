import Event from "../models/Event.js";
import Student from "../models/Student.js";
import cloudinary from "../utils/cloudinary.js";

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
    const events = await Event.find();
    if (events.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "no events are found" });
    }
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get events by id
export const getEventById = async (req, res) => {
  try {
    const events = await Event.findById(req.params.id, req.body, { new: true });
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
    const deleteEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deleteEvent) {
      return res.status(404).json({
        success: false,
        message: "event not found",
      });
    }
    res.json({ success: true, message: "event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// assigning student to an event by admin or super admin
export const assignStudentToEvent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const events = await Event.findById(req.params.id);
    if (!events) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "student not found" });
    }

    // adding students to participants
    if (!events.participants.includes(studentId)) {
      events.participants.push(studentId);
      await events.save();
    }

    // Also add event to student's assignedEvents if not already added
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
    const { title, description, date, location, hours } = req.body;
    const events = await Event.findById(req.params.id);
    if (!events) {
      return res
        .status(404)
        .json({ success: false, message: "events is not found" });
    }
    if (title) {
      events.title = title || title;
    }
    if (description) {
      events.description = description || description;
    }
    if (date) {
      events.date = date || location;
    }
    if (hours) {
      events.hours = hours || hours;
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
    const events = await Event.findById(req.params.id).populate(
      "participants",
      "name email department"
    );
    if (!events) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, participants: events.participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// upload images
export const uploadEventImages = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "event not found" });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "no image has been uploaded" });
    }

    const uploadImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      caption: file.caption,
      uploadedAt: new Date(),
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
    const { id, imageId } = req.params;
    const events = await Event.findById(id);
    if (!events) {
      return res
        .status(404)
        .json({ success: false, message: "event is not found" });
    }
    const image = event.images.id(imageId);
    if (!image) {
      return res.status(404).message("image is not found");
    }

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    image.remove();
    await events.save();
    res.status(201).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

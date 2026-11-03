import Coordinator from "../../models/Coordinator.js";
import cloudinary from "../../utils/cloudinary.js";
import Event from "../../models/Event.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import Institution from "../../models/Institution.js";
import Notification from "../../models/Notification.js";

const CATEGORIES = ["regular", "special_camp"];

// Ongoing/Completed must go through PUT /api/events/:id/start|complete, which
// record times and credit volunteer hours. Edits may only cancel or reinstate.

const ALLOWED_MANUAL_STATUS = {
  Upcoming: ["Cancelled"],
  Ongoing: ["Cancelled"],
  Cancelled: ["Upcoming"],
  Completed: [],
};
const statusChangeError = (event, status) => {
  if (!status || status === event.status) return null;
  if ((ALLOWED_MANUAL_STATUS[event.status] || []).includes(status)) return null;
  return `Cannot change status from ${event.status} to ${status} here. Use the Start / Complete actions.`;
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, hours } = req.body;
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : "regular";
    if (!title || !description || !location || !date || !hours) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields" });
    }

    // fetch coordinator
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const institutionId = coordinator.institution;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Coordinator not assigned to institution",
      });
    }

    // ---------------------------
    // 📌 SAFE IMAGE UPLOAD
    // ---------------------------
    let imageData = null;

    if (req.file) {
      try {
        const uploaded = await cloudinary.uploader.upload(req.file.path, {
          folder: "event_images",
        });

        imageData = {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          caption: req.body.caption || "",
        };
      } catch (err) {
        console.error("Cloudinary Upload Failed:", err.message);
        imageData = null; // continue without image
      }
    }

    // ---------------------------
    // 📌 CREATE EVENT
    // ---------------------------
    const newEvent = await Event.create({
      title,
      description,
      location,
      date,
      hours: hours || 0,
      category,
      assignedCoordinators: req.user._id,
      institution: institutionId,
      createdBy: req.user._id,
      images: imageData ? [imageData] : [],
      status: "Upcoming",
    });

    await Institution.findByIdAndUpdate(institutionId, {
      $push: { Events: newEvent._id },
    });

    await Coordinator.findByIdAndUpdate(req.user._id, {
      $push: { managedEvents: newEvent._id },
    });

    // ---------------------------
    // 🔔 SEND NOTIFICATIONS
    // ---------------------------

    // fetch ALL teachers
    const teachers = await Teacher.find({ institution: institutionId });

    // fetch ONLY volunteer students
    const volunteerStudents = await Student.find({
      institution: institutionId,
      role: "volunteer", // 👈 only volunteers
    });

    const notiTitle = "New Event Created";
    const notiMessage = `A new event "${title}" has been created at your institution.`;

    // notify teachers
    for (const teach of teachers) {
      await Notification.create({
        user: teach._id,
        userModel: "Teacher",
        institution: institutionId,
        title: notiTitle,
        message: notiMessage,
        event: newEvent._id,
      });
    }

    // notify volunteer students ONLY
    for (const stud of volunteerStudents) {
      await Notification.create({
        user: stud._id,
        userModel: "Student",
        institution: institutionId,
        title: notiTitle,
        message: notiMessage,
        event: newEvent._id,
      });
    }

    res.json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get student by their skill

export const updateEventStatus = async (req, res) => {
  try {
    const { eventId, status } = req.body;

    if (!eventId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID and status are required" });
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

    // Ensure event belongs to coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "Cannot update an event outside your institution",
      });
    }

    const statusError = statusChangeError(event, status);
    if (statusError) {
      return res.status(400).json({ success: false, message: statusError });
    }
    event.status = status;
    await event.save();

    res.json({
      success: true,
      message: `Event status updated to ${status}`,
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

////////////ADMIN DASHBOARD WORK/////////////

export const getMyEvents = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const myEvents = await Event.find({
      assignedCoordinators: coordinator._id, // events where this coordinator is assigned
      institution: coordinator.institution, // within same institution
    })
      .populate("participants", "name department role")
      .populate("assignedTeacher", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: myEvents.length,
      events: myEvents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit / Update an event created by the coordinator

export const editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, location, date, hours, status } = req.body;

    // find coordinator
    const coordinator = await Coordinator.findById(req.user._id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // ensure the event belongs to this coordinator's institution
    if (String(event.institution) !== String(coordinator.institution)) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit events outside your institution",
      });
    }

    // update image if new one uploaded
    let updatedImage = event.images;
    if (req.file) {
      // delete old one (optional)
      if (event.images?.[0]?.public_id) {
        await cloudinary.uploader.destroy(event.images[0].public_id);
      }

      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "event_images",
      });
      updatedImage = [
        {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          caption: req.body.caption || "",
        },
      ];
    }

    // update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.date = date || event.date;
    event.hours = hours || event.hours;
    const statusError = statusChangeError(event, status);
    if (statusError) {
      return res.status(400).json({ success: false, message: statusError });
    }
    event.status = status || event.status;
    if (CATEGORIES.includes(req.body.category)) event.category = req.body.category;
    event.images = updatedImage;

    await event.save();

    res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEventsByCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user._id);

    if (!coordinator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const events = await Event.find({
      institution: coordinator.institution,
    })
      .populate("assignedTeacher", "name email department")
      .populate("assignedCoordinators", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2️⃣ Get All Teachers in Coordinator’s Institution

export const toggleDonation = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Toggle donationOpen
    event.donationOpen = !event.donationOpen;

    await event.save();

    return res.json({
      success: true,
      message: `Donation is now ${event.donationOpen ? "OPEN" : "CLOSED"}`,
      donationOpen: event.donationOpen,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

import bcrypt from "bcryptjs";
import Coordinator from "../../models/Coordinator.js";
import cloudinary from "../../utils/cloudinary.js";
import Event from "../../models/Event.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";

export const getCoordinatorDashboard = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.user.id);
    if (!coordinator) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const institutionId = coordinator.institution;

    // Events in this institution
    const totalAllEvents = await Event.countDocuments({
      institution: institutionId,
    });
    const completedAllEvents = await Event.countDocuments({
      institution: institutionId,
      status: "Completed",
    });
    const upcomingAllEvents = await Event.countDocuments({
      institution: institutionId,
      status: "Upcoming",
    });

    // Events assigned to this coordinator (within institution)
    const totalMyEvents = await Event.countDocuments({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
    });
    const completedMyEvents = await Event.countDocuments({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
      status: "Completed",
    });
    const upcomingMyEvents = await Event.countDocuments({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
      status: "Upcoming",
    });

    // Students / Volunteers / Teachers in this institution
    const totalStudents = await Student.countDocuments({
      institution: institutionId,
    });
    const totalVolunteers = await Student.countDocuments({
      institution: institutionId,
      role: "volunteer",
    });
    const totalTeachers = await Teacher.countDocuments({
      institution: institutionId,
    });

    // Grace marks recommended for events/coordinator within institution (approx)
    const totalGraceRecommendations = await Event.aggregate([
      { $match: { institution: institutionId } },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $size: { $ifNull: ["$recommendedGraceMarks", []] } },
          },
        },
      },
    ]);

    // Recent events for institution and coordinator
    const recentAllEvents = await Event.find({ institution: institutionId })
      .sort({ date: -1 })
      .limit(5)
      .select("title date status");

    const recentMyEvents = await Event.find({
      assignedCoordinators: coordinator._id,
      institution: institutionId,
    })
      .sort({ date: -1 })
      .limit(5)
      .select("title date status");

    res.json({
      success: true,
      data: {
        allEvents: {
          totalEvents: totalAllEvents,
          completedEvents: completedAllEvents,
          upcomingEvents: upcomingAllEvents,
          recentEvents: recentAllEvents,
        },
        myEvents: {
          totalEvents: totalMyEvents,
          completedEvents: completedMyEvents,
          upcomingEvents: upcomingMyEvents,
          recentEvents: recentMyEvents,
        },
        totalStudents,
        totalVolunteers,
        totalTeachers,
        totalGraceRecommendations: totalGraceRecommendations[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching coordinator dashboard",
      error: error.message,
    });
  }
};

// manage student (get students from the institute)

export const getCoordinatorProfile = async (req, res) => {
  try {
    const coordinatorId = req.user._id; // ✅ From auth middleware

    const coordinator = await Coordinator.findById(coordinatorId)
      .select("-password")
      .populate("institution", "name _id");

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Coordinator not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        _id: coordinator._id,
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phoneNumber,
        department: coordinator.department,
        institution: coordinator.institution?._id || null,
        institutionName: coordinator.institution?.name || null,
        profileImage: coordinator.profileImage?.url || null,
        role: coordinator.role,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching coordinator profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// ==========================
// UPDATE COORDINATOR PROFILE
// ==========================

export const updateCoordinatorProfile = async (req, res) => {
  try {
    const coordinatorId = req.user._id;
    // institution is deliberately NOT editable here: moving yourself to another
    // institution would grant access to its students and events.
    const { name, phone, department, password } = req.body;
    let profileImage = null;

    // ✅ Find existing record
    const coordinator = await Coordinator.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: "Coordinator not found",
      });
    }

    // ✅ Handle image upload if provided (Base64 or file)
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "coordinators",
      });
      profileImage = uploaded.secure_url;
    } else if (
      req.body.profileImage &&
      req.body.profileImage.startsWith("data:image")
    ) {
      // If image is base64
      const uploaded = await cloudinary.uploader.upload(req.body.profileImage, {
        folder: "coordinators",
      });
      profileImage = uploaded.secure_url;
    }

    // ✅ Handle optional password change
    let hashedPassword = coordinator.password;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // ✅ Update allowed fields
    coordinator.name = name || coordinator.name;
    // API field is `phone`; the schema field is `phoneNumber` (writes to `phone` were silently dropped).
    coordinator.phoneNumber = phone || coordinator.phoneNumber;
    coordinator.department = department || coordinator.department;
    coordinator.password = hashedPassword;
    coordinator.profileImage = profileImage || coordinator.profileImage;

    await coordinator.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: coordinator._id,
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phoneNumber,
        department: coordinator.department,
        institution: coordinator.institution,
        profileImage: coordinator.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ Error updating coordinator profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

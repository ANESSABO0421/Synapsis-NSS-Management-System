import Coordinator from "../../models/Coordinator.js";
import cloudinary from "../../utils/cloudinary.js";

export const getAllPendingCoordinator = async (req, res) => {
  try {
    const pendingCoordinator = await Coordinator.find({
      status: "pending",
    }).select("-password -otp -otpExpiry");
    res.json({
      success: true,
      count: pendingCoordinator.length,
      coordinator: pendingCoordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// approve coordinator

export const approveCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinator = await Coordinator.findById(id);
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Coordinator Not Found" });
    }

    if (coordinator.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "Student Already" });
    }

    coordinator.status = "active";
    await coordinator.save();
    res.json({
      success: true,
      message: `${coordinator.name} has been approved successfully`,
      coordinator: await coordinator.populate("institution", "name address"),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// reject

export const rejectCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinator = await Coordinator.findById(id);
    if (!coordinator) {
      return res
        .status(404)
        .json({ success: false, message: "Student Not Found" });
    }

    if (coordinator.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "Student Already active" });
    }
    coordinator.status = "rejected";
    if (coordinator.profileImage?.public_id) {
      await cloudinary.uploader.destroy(coordinator.profileImage.public_id);
    }

    await coordinator.save();
    res.json({
      success: true,
      message: `${coordinator.name} has been rejected successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCoordinators = async (req, res) => {
  try {
    const coordinator = await Coordinator.find()
      .populate("institution", "name address contactEmail")
      .select("-password -otp -otpExpiry") // don’t return sensitive data
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coordinator.length,
      coordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectInDashboardCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!coordinator)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.json({
      success: true,
      message: "Student rejected successfully",
      coordinator,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== COORDINATOR DASHBOARD =====================

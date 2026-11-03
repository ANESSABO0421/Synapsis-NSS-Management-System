import express from "express";
import { loginSchema, otpSchema, validate } from "../middleware/validate.js";
import {
  signUp,
  verifyOTP,
  login,
  createAdminBySuperadmin,
  updateAdmin,
  deleteAdmin,
  getDashboardStat,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminController.js";
import {
  adminOnly,
  protect,
  superAdminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/signup", signUp);
router.post("/verify-otp", validate(otpSchema("adminId")), verifyOTP);
router.post("/login", validate(loginSchema), login);
router.put("/updateadmin/:id", protect, adminOnly, updateAdmin);
router.delete("/deleteadmin/:id", protect, superAdminOnly, deleteAdmin);

// dashboard data
router.get("/dashboardata", protect, adminOnly, getDashboardStat);

router.post("/create-admin", protect, superAdminOnly, createAdminBySuperadmin);
router.get("/profile", protect, getAdminProfile);
router.put("/profile", protect, updateAdminProfile);

export default router;

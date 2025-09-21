import express from "express";
import passport from "passport";
import {
  signUp,
  verifyOTP,
  login,
  googleCallback,
  createAdminBySuperadmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/signup", signUp);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.put("/updateadmin/:id", protect, updateAdmin);
router.delete("/deleteadmin/:id", protect, superAdminOnly, deleteAdmin);

// Step 1: Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);
// Superadmin only
router.post("/create-admin", protect, superAdminOnly, createAdminBySuperadmin);

export default router;

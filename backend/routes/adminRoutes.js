import express from "express";
import passport from "passport";
import {
  signUp,
  verifyOTP,
  login,
  googleCallback,
  createAdminBySuperadmin,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/signup", signUp);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

// Superadmin only
router.post("/create-admin", protect, createAdminBySuperadmin);

export default router;

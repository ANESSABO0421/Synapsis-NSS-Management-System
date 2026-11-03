
import express from "express";
import { login } from "../controllers/authController.js";
import { loginSchema, validate } from "../middleware/validate.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Unified email/password login for every role.
router.post("/login", validate(loginSchema), login);

// Detect environment
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://synapsenssmanagement.vercel.app"
    : "http://localhost:5173";

// Step 1: Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=notregistered`,
    session: false,
  }),
  (req, res) => {
    const { id, role } = req.user;

    // Generate JWT
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Redirect to frontend success page (works on local + Vercel)
    return res.redirect(
      `${FRONTEND_URL}/auth/success?token=${token}&role=${role}`
    );
  }
);

export default router;

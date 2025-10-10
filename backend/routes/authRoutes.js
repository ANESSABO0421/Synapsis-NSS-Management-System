import express from "express";
import passport from "passport";

const router = express.Router();

// Step 1: Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login?error=notregistered",
  }),
  (req, res) => {
    // console.log(req.user)
    if (req.user.role === "admin") {
      return res.redirect("http://localhost:5173/adminpanel");
    } else if (req.user.role === "student") {
      return res.redirect("http://localhost:5173/studentdashboard");
    } else {
      return res.redirect("http://localhost:5173/");
    }
  }
);

export default router;

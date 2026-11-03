
import express from "express";
import { genericOtpSchema, loginSchema, otpSchema, validate } from "../middleware/validate.js";
import {
  // Signup,
  // verifyOtp,
  loginAlumni,
  // approveAlumni,
  // updateAlumni,
  // deleteAlumni,
  addTestimonial,
  // addAchievement,
  updateTestimonialVisibility,
  // getTopTestimonials,
  signupAlumni,
  getTopTestimonials,
  getAllAlumnis,
  getAllPendingAlumni,
  approveAlumni,
  rejectAlumni,
  rejectInDashboardAlumni,
  getAlumniDashboard,
  getAlumniProfile,
  updateAlumniProfile,
  getAllTestimonials,
  getAllImages,
} from "../controllers/alumniController.js";
import {
  adminOnly,
  alumniOnly,
  protect,
  superAdminOnly,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { getAllEventsAlumniInstituition } from "../controllers/eventController.js";

const alumniRouter = express.Router();

/* ===========================
        AUTHENTICATION
   =========================== */
alumniRouter.post("/signup", upload.single("profileImage"), signupAlumni);
alumniRouter.post("/login", validate(loginSchema), loginAlumni);

/* ===========================
        ADMIN ACTIONS
   =========================== */

/* ===========================
        TESTIMONIALS
   =========================== */
// Alumni adds testimonial
alumniRouter.post("/testimonial", protect, alumniOnly, addTestimonial);

// Admin updates visibility (approve/reject)
alumniRouter.put(
  "/:id/testimonial/:testimonialId/visibility",
  protect,
  superAdminOnly,
  updateTestimonialVisibility
);

// Public route — get top 3 approved testimonials
alumniRouter.get("/testimonials/top", getTopTestimonials);

/* ===========================
        ACHIEVEMENTS
   =========================== */

// admin action
alumniRouter.get("/", protect, adminOnly, getAllAlumnis);
alumniRouter.get("/pending", protect, adminOnly, getAllPendingAlumni);
alumniRouter.put("/approve/:id", protect, adminOnly, approveAlumni);
alumniRouter.put("/reject/:id", protect, adminOnly, rejectAlumni);
alumniRouter.put(
  "/reject-dashboard/:id",
  protect,
  adminOnly,
  rejectInDashboardAlumni
);

alumniRouter.get("/dashboard", protect, alumniOnly, getAlumniDashboard);

alumniRouter.get("/getalleventsalumniinstituition", protect, alumniOnly,getAllEventsAlumniInstituition );

// Alumni Profile
alumniRouter.get("/profile", protect, alumniOnly, getAlumniProfile);
alumniRouter.put(
  "/profile",
  protect,
  alumniOnly,
  upload.single("profileImage"),
  updateAlumniProfile
);

alumniRouter.get("/allinstituteimages",protect,alumniOnly,getAllImages)

alumniRouter.get("/testimonials", protect, superAdminOnly, getAllTestimonials);

export default alumniRouter;

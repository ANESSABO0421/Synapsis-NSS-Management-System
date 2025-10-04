import express from "express";
import {
  addAchievement,
  addTestimonial,
  approveAlumni,
  deleteAlumni,
  Login,
  Signup,
  updateAlumni,
  verifyOtp,
  updateTestimonialVisibility,
  getTopTestimonial,
} from "../controllers/alumniController.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const alumniRouter = express.Router();

alumniRouter.post("/alumnisignup", upload.single("profileImage"), Signup);
alumniRouter.post("/verifyotp/:id", verifyOtp);
alumniRouter.post("/login", Login);

// admin approval
alumniRouter.put("/alumniapproval/:id", protect, approveAlumni);
alumniRouter.put(
  "/updatealumni/:id",
  protect,
  upload.single("profileImage"),
  updateAlumni
);
alumniRouter.delete("/delete/:id", protect, deleteAlumni);

// alumni achievement and testimonial adding
alumniRouter.post("/:id/addalumniachievement", protect, addTestimonial);
alumniRouter.post("/:id/addachievement", protect, addAchievement);

// Admin approves/rejects testimonial
alumniRouter.put(
  "/:id/:testimonialId",
  protect,
  updateTestimonialVisibility
);

// Public - get top 3 approved testimonials
alumniRouter.get("/top/all", getTopTestimonial);

export default alumniRouter;

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
} from "../controllers/alumniController.js";
import { protect } from "../middleware/authMiddleware.js";

const alumniRouter = express.Router();

alumniRouter.post("/alumnisignup", Signup);
alumniRouter.post("/verifyotp", verifyOtp);
alumniRouter.post("/login", Login);

// admin approval
alumniRouter.put("/alumniapproval/:id", protect, approveAlumni);
alumniRouter.put("/updatealumni/:id", protect, updateAlumni);
alumniRouter.delete("/delete/:id", protect, deleteAlumni);

// alumni achievement and testimonial adding
alumniRouter.post("/:id/addalumniachievement", protect, addTestimonial);
alumniRouter.post("/:id/addachievement", protect, addAchievement);

export default alumniRouter;

import express from "express";
import { genericOtpSchema, loginSchema, otpSchema, validate } from "../middleware/validate.js";
import { verifyOtp } from "../controllers/otpController.js";

const otpRouter = express.Router();

// universal otp route for all roles
otpRouter.post("/verify-otp", validate(genericOtpSchema), verifyOtp);

export default otpRouter;

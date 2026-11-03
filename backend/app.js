// Must be first: loads .env and exits early if required variables are missing.
import { config } from "./configs/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import passport from "passport";

import "./configs/passport.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { aiLimiter, apiLimiter, authLimiter } from "./middleware/rateLimiters.js";
import { stripeWebhook } from "./controllers/donationController.js";

// Routes
import adminRouter from "./routes/adminRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from "./routes/StudentRoutes.js";
import alumniRouter from "./routes/alumniRoutes.js";
import teacherRoute from "./routes/teacherRoutes.js";
import coordinatorRoute from "./routes/coordinatorRoute.js";
import otpRouter from "./routes/otpRoute.js";
import instituteRouter from "./routes/institutionRoutes.js";
import airouter from "./routes/aiRoute.js";
import messagerouter from "./routes/messageRoutes.js";
import notificationRoute from "./routes/notificationRoutes.js";
import donationRouter from "./routes/donationRoutes.js";
import mentorshipRouter from "./routes/mentorshipRoutes.js";
import mentorshipMessage from "./routes/mentorshipMessageRoutes.js";

const app = express();
app.set("trust proxy", 1); // behind Render/Vercel proxy: needed for correct client IPs in rate limiting

// ---------- Security & parsing ----------
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Stripe needs the raw body to verify signatures — register BEFORE express.json().
app.post("/api/donations/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(passport.initialize());

// ---------- Rate limits ----------
app.use("/api", apiLimiter);
app.use(
  [
    "/api/admin/signup",
    "/api/admin/login",
    "/api/admin/verify-otp",
    "/api/students/studentsignup",
    "/api/students/studentlogin",
    "/api/students/student-verify-otp",
    "/api/alumni/signup",
    "/api/alumni/login",
    "/api/teacher/signup",
    "/api/teacher/login",
    "/api/teacher/verify-otp",
    "/api/coordinator/coordinatorsignup",
    "/api/coordinator/logincoordinator",
    "/api/coordinator/verifyotp",
    "/api/otp",
  ],
  authLimiter
);
app.use("/api/ai", aiLimiter);

// ---------- Health ----------
app.get("/health", (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ok" : "degraded", db: dbUp });
});

// ---------- API routes ----------
app.use("/api/admin", adminRouter);
app.use("/api/chat", messagerouter);
app.use("/api/events", eventRouter);
app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use("/api/alumni", alumniRouter);
app.use("/api/teacher", teacherRoute);
app.use("/api/coordinator", coordinatorRoute);
app.use("/api/institution", instituteRouter);
app.use("/api/otp", otpRouter);
app.use("/api/ai", airouter);
app.use("/api/notification", notificationRoute);
app.use("/api/donations", donationRouter);
app.use("/api/mentorship", mentorshipRouter);
app.use("/api/mentorshipmessage", mentorshipMessage);

app.use(notFound);
app.use(errorHandler);

export default app;

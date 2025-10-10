import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { ConnectDb } from "./configs/db.js";
import router from "./routes/adminRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from "./routes/StudentRoutes.js";
import alumniRouter from "./routes/alumniRoutes.js";
import "./configs/passport.js";
import teacherRoute from "./routes/teacherRoutes.js";
import coordinatorRoute from "./routes/coordinatorRoute.js";

dotenv.config();
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

// For Google OAuth with Passport
app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Mount routers
app.use("/api/admin", router);
app.use("/api/events", eventRouter);
app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use("/api/alumni", alumniRouter);
app.use("/api/teacher", teacherRoute);
app.use("/api/coordinator", coordinatorRoute);

ConnectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Failed to start server:", error.message);
  });

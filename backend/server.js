import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";


import { ConnectDb } from "./configs/db.js";
import router from "./routes/adminRoutes.js"; // your auth router

dotenv.config();
const port = process.env.PORT || 5000;

import "./configs/passport.js"


const app = express();
app.use(express.json());
app.use(cors());

// For Google OAuth with Passport
app.use(session({ secret: "your_secret_key", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Mount routers
app.use("/api/auth", router);
// app.use("/api/services", serviceRouter); // if you have service routes

ConnectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Failed to start server:", error.message);
  });

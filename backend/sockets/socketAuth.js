import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Coordinator from "../models/Coordinator.js";
import Alumni from "../models/Alumni.js";
import Admin from "../models/Admin.js";

const MODELS = {
  student: Student,
  volunteer: Student,
  teacher: Teacher,
  coordinator: Coordinator,
  alumni: Alumni,
  admin: Admin,
  superadmin: Admin,
};

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = MODELS[decoded.role];
    if (!Model) return next(new Error("Unsupported role"));

    const user = await Model.findById(decoded.id).select("name institution role status");
    if (!user) return next(new Error("User not found"));
    if (["rejected", "inactive"].includes(user.status)) {
      return next(new Error("Account is not active"));
    }

    // Student/Admin docs carry their real role (volunteer, superadmin, ...).
    const role = Model === Student || Model === Admin ? user.role : decoded.role;

    socket.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      role,
      institution: user.institution?.toString?.() || "",
    };
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
};

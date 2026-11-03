// @ts-check
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Alumni from "../models/Alumni.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Coordinator from "../models/Coordinator.js";

// JWT `role` claim -> model + the req property legacy controllers read from.
const ROLE_MODELS = {
  admin: { model: Admin, key: "admin" },
  superadmin: { model: Admin, key: "admin" },
  alumni: { model: Alumni, key: "alumni" },
  student: { model: Student, key: "student" },
  volunteer: { model: Student, key: "student" },
  teacher: { model: Teacher, key: "teacher" },
  coordinator: { model: Coordinator, key: "coordinator" },
};

// Order used for tokens issued before the role claim existed.
const LEGACY_LOOKUP = ["admin", "alumni", "student", "teacher", "coordinator"];

const findUser = async ({ id, role }) => {
  const entry = ROLE_MODELS[role];
  if (entry) {
    const user = await entry.model.findById(id).select("-password -otp -otpExpiry");
    return user ? { user, key: entry.key } : null;
  }
  for (const r of LEGACY_LOOKUP) {
    const { model, key } = ROLE_MODELS[r];
    const user = await model.findById(id).select("-password -otp -otpExpiry");
    if (user) return { user, key };
  }
  return null;
};

// Effective role: Admin and Student docs carry their own role field
// (admin/superadmin, student/volunteer); the others are fixed by collection.
const effectiveRole = (user, key) =>
  key === "admin" || key === "student" ? user.role : key;

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }

  try {
    const found = await findUser(decoded);
    if (!found) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }
    if (found.user.status && ["rejected", "inactive"].includes(found.user.status)) {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    const { user, key } = found;
    req[key] = user;
    req.user = user;
    req.user.role = effectiveRole(user, key);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role gate. Roles: superadmin, admin, coordinator, teacher, volunteer, student, alumni.
 * "admin" also admits superadmin; "student" also admits volunteer (a volunteer is a student).
 */
export const authorize = (...roles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  const allowed =
    roles.includes(role) ||
    (role === "superadmin" && roles.includes("admin")) ||
    (role === "volunteer" && roles.includes("student"));
  if (!allowed) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

export const superAdminOnly = authorize("superadmin");
export const adminOnly = authorize("admin");
export const teacherOnly = authorize("teacher");
export const volunteerOnly = authorize("volunteer");
export const coordinatorOnly = authorize("coordinator");
export const alumniOnly = authorize("alumni");

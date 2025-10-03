import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Alumni from "../models/Alumni.js";
import Student from "../models/Student.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;

      if (decoded.role === "admin" || decoded.role === "superadmin") {
        user = await Admin.findById(decoded.id).select("-password");
        req.admin = user;
      } else if (decoded.role === "alumni") {
        user = await Alumni.findById(decoded.id).select("-password");
        req.alumni = user;
      } else if (decoded.role === "student") {
        user = await Student.findById(decoded.id).select("-password");
        req.student = user;
      }

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

export const superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized, no user" });
  }

  if (req.admin.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied, Superadmin only" });
  }

  next();
};

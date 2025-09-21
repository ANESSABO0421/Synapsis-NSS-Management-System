import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  let token;
  //token starts with bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      //check both the jwt code and token then verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //take user from db and exclude password
      req.admin = await Admin.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized ,token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised and no token" });
  }
};

// for superadmin

export const superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorised,no user" });
  }

  if (req.admin.role != "superadmin") {
    return res.status(403).json({ message: "Access denied,Superadmin only" });
  }
  next();
};

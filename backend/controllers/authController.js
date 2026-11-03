// @ts-check
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Alumni from "../models/Alumni.js";
import Coordinator from "../models/Coordinator.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

// Same order the login page used to try endpoints in.
// `uiRole` is what the frontend stores/routes on; the JWT carries the real role
// (superadmin / volunteer) so authorization stays precise.
/** @type {Array<{ model: import("mongoose").Model<any>, uiRole: string, tokenRole: (u: any) => string }>} */
const ACCOUNT_TYPES = [
  { model: Admin, uiRole: "admin", tokenRole: (u) => u.role },
  { model: Coordinator, uiRole: "coordinator", tokenRole: () => "coordinator" },
  { model: Student, uiRole: "student", tokenRole: () => "student" },
  { model: Teacher, uiRole: "teacher", tokenRole: () => "teacher" },
  { model: Alumni, uiRole: "alumni", tokenRole: () => "alumni" },
];

const INVALID = { success: false, message: "Invalid email or password" };

// A real bcrypt hash so unknown emails take as long as wrong passwords
// (prevents discovering registered emails by timing).
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", 10);

export const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * POST /api/auth/login { email, password }
 * One request instead of five. Status is only revealed after the password
 * matches, and unknown email / wrong password return the same message.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let matched = null;
    let checkedAny = false;
    for (const type of ACCOUNT_TYPES) {
      const user = await type.model.findOne({ email }).select("+password");
      if (!user?.password) continue;
      checkedAny = true;
      if (await bcrypt.compare(password, user.password)) {
        matched = { user, type };
        break;
      }
    }
    if (!checkedAny) await bcrypt.compare(password, DUMMY_HASH);
    if (!matched) return res.status(401).json(INVALID);

    const { user, type } = matched;
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          user.status === "rejected"
            ? "Your account registration was rejected. Contact your institution."
            : "Your account is awaiting approval or OTP verification.",
      });
    }

    const token = signToken(user._id, type.tokenRole(user));
    res.json({
      success: true,
      message: "Login successful",
      token,
      role: type.uiRole,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || type.uiRole },
    });
  } catch (error) {
    next(error);
  }
};

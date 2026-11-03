import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const json = (message) => ({ success: false, message });
const skip = () => process.env.NODE_ENV === "test";
const common = { standardHeaders: "draft-8", legacyHeaders: false, skip };

// Global safety net.
export const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: json("Too many requests, please try again later."),
});

// Brute-force protection per (IP, account). Keyed on email too, because a whole
// campus often shares one public IP and must not lock each other out.
export const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => {
    const id = String(req.body?.email || req.body?.id || req.body?.studentId ||
      req.body?.teacherId || req.body?.adminId || "").toLowerCase();
    return `${ipKeyGenerator(req.ip)}|${id}`;
  },
  message: json("Too many attempts for this account, please try again in 15 minutes."),
});

// Coarser per-IP cap on auth routes (credential stuffing across many emails).
export const authIpLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: json("Too many attempts from this network, please try again later."),
});

// LLM calls cost money.
export const aiLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: json("AI request limit reached, please try again later."),
});

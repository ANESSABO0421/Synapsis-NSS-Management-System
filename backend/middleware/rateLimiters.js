import rateLimit from "express-rate-limit";

const json = (message) => ({ success: false, message });
const skip = () => process.env.NODE_ENV === "test";

// Global safety net.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  message: json("Too many requests, please try again later."),
});

// Login / signup / OTP: brute-force protection.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  message: json("Too many attempts, please try again in 15 minutes."),
});

// LLM calls cost money.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  message: json("AI request limit reached, please try again later."),
});

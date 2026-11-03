import dotenv from "dotenv";

dotenv.config();

// Required to boot. Optional integrations (Stripe, AI, OAuth, email) degrade
// per-feature instead of crashing the server.
const REQUIRED = ["MONGODB_URL", "JWT_SECRET"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  console.error("   Copy backend/.env.example to backend/.env and fill them in.");
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn("⚠️  JWT_SECRET is shorter than 32 characters — use a long random value in production.");
}

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://synapse-three-rho.vercel.app",
  "https://synapsenssmanagement.vercel.app",
];

export const config = {
  port: Number(process.env.PORT) || 5000,
  // Public frontend URL, used in QR codes and certificate verification links.
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, ""),
  isProduction: process.env.NODE_ENV === "production",
  // Comma-separated override, e.g. CORS_ORIGINS=https://a.app,https://b.app
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : DEFAULT_ORIGINS,
};

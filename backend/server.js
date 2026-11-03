// Must be first: loads .env and exits early if required variables are missing.
import { config } from "./configs/env.js";

import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import app from "./app.js";
import { ConnectDb } from "./configs/db.js";
import { registerSockets } from "./sockets/index.js";

// ---------- Boot ----------
const start = async () => {
  await ConnectDb();
  console.log("✅ MongoDB connected successfully");

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: config.corsOrigins, methods: ["GET", "POST"], credentials: true },
  });
  app.set("io", io);
  registerSockets(io);

  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    io.close();
    server.close(() => mongoose.connection.close().then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
  console.error("❌ Failed to start server:", error.message);
  process.exit(1);
});


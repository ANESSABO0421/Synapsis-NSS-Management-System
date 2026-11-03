// @ts-check
// Must be first: loads .env and exits early if required variables are missing.
import { config } from "./configs/env.js";

import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import app from "./app.js";
import { ConnectDb } from "./configs/db.js";
import { registerSockets } from "./sockets/index.js";
import { logger } from "./utils/logger.js";

// ---------- Boot ----------
const start = async () => {
  await ConnectDb();
  logger.info("MongoDB connected");

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: config.corsOrigins, methods: ["GET", "POST"], credentials: true },
  });
  app.set("io", io);
  registerSockets(io);

  server.listen(config.port, () => {
    logger.info({ port: config.port }, "Server listening");
  });

  const shutdown = (signal) => {
    logger.info({ signal }, "Shutting down");
    io.close();
    server.close(() => mongoose.connection.close().then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
  logger.fatal({ err: error }, "Failed to start server");
  process.exit(1);
});


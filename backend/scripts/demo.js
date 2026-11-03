/**
 * Zero-setup demo / E2E backend: in-memory MongoDB + seed data + API server.
 *
 *   npm run demo          # API on PORT (default 3000), data discarded on exit
 *
 * Nothing touches your real database (MONGODB_URL is overridden).
 */
import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URL = mongod.getUri("synapsis-demo");
process.env.JWT_SECRET ||= "demo-secret-demo-secret-demo-secret-demo-secret";
process.env.PORT ||= "3000";
process.env.NODE_ENV = process.env.NODE_ENV === "production" ? "development" : process.env.NODE_ENV || "development";

const mongoose = (await import("mongoose")).default;
const { seed, DEMO_PASSWORD } = await import("./seed.js");
await mongoose.connect(process.env.MONGODB_URL);
await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
await seed();
await mongoose.disconnect();

console.log(`🌱 Demo data ready (password for every demo account: ${DEMO_PASSWORD})`);
await import("../server.js");

const stop = async () => {
  await mongod.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

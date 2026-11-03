import mongoose from "mongoose";

// Connection errors propagate to server.js, which logs them and exits.
export function ConnectDb() {
  return mongoose.connect(process.env.MONGODB_URL);
}

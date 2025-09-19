import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDb } from "./configs/db.js";

dotenv.config();
const port = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

ConnectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`server created at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("failed to create server:", error.message);
  });

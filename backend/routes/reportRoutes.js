import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { getAnnualReport } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/annual", protect, authorize("coordinator", "admin"), getAnnualReport);

export default reportRouter;

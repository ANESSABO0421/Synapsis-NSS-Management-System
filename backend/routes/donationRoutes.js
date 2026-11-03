import express from "express";
import { alumniOnly, authorize, protect } from "../middleware/authMiddleware.js";
import {
  createPaymentIntent,
  getEventDonations,
  saveDonation,
} from "../controllers/donationController.js";

const donationRouter = express.Router();

donationRouter.post("/create-intent", protect, alumniOnly, createPaymentIntent);
donationRouter.post("/save", protect, alumniOnly, saveDonation);
donationRouter.get(
  "/event/:eventId",
  protect,
  authorize("alumni", "coordinator", "admin"),
  getEventDonations
);

// POST /api/donations/webhook is mounted in server.js (needs the raw body).

export default donationRouter;

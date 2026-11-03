// @ts-check
import mongoose from "mongoose";
import { stripe } from "../utils/stripe.js";
import Event from "../models/Event.js";
import Donation from "../models/Donation.js";

const MIN_AMOUNT = 1; // INR
const MAX_AMOUNT = 500000; // INR, guards against fat-finger / abuse

// 1. Create Stripe PaymentIntent
export const createPaymentIntent = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const { eventId } = req.body;

    if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Amount must be a whole number between ${MIN_AMOUNT} and ${MAX_AMOUNT}`,
      });
    }
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event" });
    }

    const event = await Event.findById(eventId).select("donationOpen institution");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (!event.donationOpen) {
      return res.status(400).json({ success: false, message: "Donations closed" });
    }
    if (String(event.institution) !== String(req.alumni.institution)) {
      return res
        .status(403)
        .json({ success: false, message: "You can only donate to your institution's events" });
    }

    const intent = await stripe.paymentIntents.create({
      amount: amount * 100, // paise
      currency: "inr",
      payment_method_types: ["card"],
      metadata: { eventId: String(eventId), alumniId: String(req.alumni._id) },
    });

    res.json({ success: true, clientSecret: intent.client_secret });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a donation from a PaymentIntent. Stripe is the source of truth:
 * amount, event and donor all come from the intent, never from the client.
 * Idempotent — the unique index on paymentId makes replays a no-op.
 */
export const recordDonationFromIntent = async (intent, message = "") => {
  if (intent.status !== "succeeded") return { recorded: false, reason: "not_succeeded" };

  const { eventId, alumniId } = intent.metadata || {};
  if (!eventId || !alumniId) return { recorded: false, reason: "missing_metadata" };

  const amount = intent.amount_received / 100;
  try {
    await Donation.create({
      eventId,
      alumniId,
      amount,
      paymentId: intent.id,
      message: String(message).slice(0, 500),
    });
  } catch (error) {
    if (error.code === 11000) return { recorded: false, reason: "duplicate" };
    throw error;
  }
  await Event.findByIdAndUpdate(eventId, { $inc: { totalCollected: amount } });
  return { recorded: true, amount };
};

// 2. Save donation after client-side confirmation
export const saveDonation = async (req, res, next) => {
  try {
    const { paymentId, message } = req.body;
    if (typeof paymentId !== "string" || !paymentId.startsWith("pi_")) {
      return res.status(400).json({ success: false, message: "Invalid payment id" });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentId);
    if (intent.metadata?.alumniId !== String(req.alumni._id)) {
      return res
        .status(403)
        .json({ success: false, message: "This payment does not belong to you" });
    }

    const result = await recordDonationFromIntent(intent, message);
    if (!result.recorded && result.reason !== "duplicate") {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed. Not saving donation." });
    }

    res.json({ success: true, message: "Donation saved successfully" });
  } catch (error) {
    next(error);
  }
};

// 3. Stripe webhook — mounted with express.raw() in server.js.
// Records donations even if the browser closes before calling /save.
export const stripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send("Webhook not configured");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    try {
      await recordDonationFromIntent(event.data.object);
    } catch (err) {
      console.error("Webhook donation record failed:", err);
      return res.status(500).send("Failed to record donation");
    }
  }
  res.json({ received: true });
};

// 4. Donor list: coordinator of the event, admins, or an alumnus (own donations only)
export const getEventDonations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event" });
    }

    const filter = { eventId };
    const { role } = req.user;

    if (role === "alumni") {
      filter.alumniId = req.alumni._id;
    } else if (role === "coordinator") {
      const event = await Event.findById(eventId).select("assignedCoordinators");
      if (!event) return res.status(404).json({ success: false, message: "Event not found" });
      if (String(event.assignedCoordinators) !== String(req.coordinator._id)) {
        return res.status(403).json({ success: false, message: "Not your event" });
      }
    }

    const donations = await Donation.find(filter)
      .populate("alumniId", "name email")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    next(error);
  }
};

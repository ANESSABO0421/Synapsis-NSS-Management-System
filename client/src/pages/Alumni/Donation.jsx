// src/pages/Donation.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiMapPin, FiClock, FiRefreshCcw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/* ===========================================
    PAYMENT MODAL (Responsive)
=========================================== */
const PaymentModal = ({ event, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("token");

  const handlePay = async () => {
    if (!amount || Number(amount) < 50) {
      toast.error("Minimum donation amount is ₹50");
      return;
    }

    try {
      setProcessing(true);

      const res = await axios.post(
        "http://localhost:3000/api/donations/create-intent",
        { amount, eventId: event._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientSecret = res.data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
        setProcessing(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        await axios.post(
          "http://localhost:3000/api/donations/save",
          {
            eventId: event._id,
            amount,
            paymentId: result.paymentIntent.id,
            message,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        navigate("/alumnilayout/success-donation", {
          state: { amount, eventName: event.title },
        });

        onClose();
      }
    } catch (err) {
      toast.error("Payment failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6 z-[999]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md rounded-xl p-6 sm:p-8 shadow-xl relative border border-gray-200"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-600 hover:text-red-500 text-xl"
          >
            ×
          </button>

          {/* Stripe Branding */}
          <div className="flex justify-center mb-4">
            <img
              src="https://cdn.worldvectorlogo.com/logos/stripe-4.svg"
              alt="Stripe"
              className="h-6 opacity-90"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">
            Secure Donation
          </h2>

          <p className="text-center text-gray-600 text-sm mb-4">
            Event: <span className="font-semibold">{event.title}</span>
          </p>

          {/* AMOUNT */}
          <label className="block text-sm font-medium text-gray-700">
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            placeholder="Min ₹50"
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 mb-4 p-3 rounded-md border border-gray-300"
          />

          {/* MESSAGE */}
          <label className="block text-sm font-medium text-gray-700">
            Message (optional)
          </label>
          <textarea
            className="w-full p-3 mt-1 mb-4 rounded-md border border-gray-300"
            placeholder="Write a short note..."
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* CARD FIELD */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3 mb-5 shadow-sm bg-white">
            <CardElement />
          </div>

          {/* PAY BUTTON */}
          <button
            onClick={handlePay}
            disabled={!stripe || processing}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
          >
            {processing ? "Processing..." : `Pay ₹${amount || ""}`}
          </button>

          <p className="text-center mt-4 text-gray-500 text-xs">
            🔒 Payments securely processed by Stripe
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ===========================================
    MAIN DONATION PAGE (Responsive)
=========================================== */
const Donation = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/alumni/getalleventsalumniinstituition",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(res.data.events || []);
    } catch {
      toast.error("Failed loading events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading events...</p>;

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800">
              Support Your Institution’s Events
            </h2>

            <button
              onClick={fetchEvents}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full sm:w-auto"
            >
              <FiRefreshCcw /> Refresh
            </button>
          </div>

          {/* EVENT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <motion.div
                key={e._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-green-500 rounded-xl p-6 shadow-md flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-800">{e.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{e.description}</p>

                  <div className="space-y-1 text-gray-700 text-sm">
                    <p className="flex items-center gap-2"><FiCalendar /> {new Date(e.date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2"><FiMapPin /> {e.location}</p>
                    <p className="flex items-center gap-2"><FiClock /> {e.hours} hrs</p>
                  </div>

                  <div className="mt-4 text-sm font-semibold text-green-700">
                    Donation: {e.donationOpen ? "OPEN" : "CLOSED"}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    Total Collected: ₹{e.totalCollected}
                  </div>
                </div>

                {e.donationOpen && (
                  <button
                    onClick={() => setSelectedEvent(e)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
                  >
                    Donate Now
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {selectedEvent && (
          <PaymentModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </div>
    </Elements>
  );
};

export default Donation;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiMapPin, FiClock, FiRefreshCcw, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Stripe public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);



// ======================================================
// ⭐ Payment Modal Component (Stripe)
// ======================================================
const PaymentModal = ({ eventId, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("token");

  const handlePay = async () => {
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      setProcessing(true);

      // 1️⃣ Create payment intent (YOUR BACKEND URL)
      const res = await axios.post(
        "http://localhost:3000/api/donations/create-intent",
        { amount, eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientSecret = res.data.clientSecret;

      // 2️⃣ Confirm with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
        setProcessing(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        // 3️⃣ Save donation (YOUR BACKEND URL)
        await axios.post(
          "http://localhost:3000/api/donations/save",
          {
            eventId,
            amount,
            paymentId: result.paymentIntent.id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("🎉 Donation Successful!");
        onClose();
      }
    } catch (err) {
      toast.error("Payment failed!");
      console.log(err);
    }

    setProcessing(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          >
            <FiX size={22} />
          </button>

          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Donate to Event
          </h2>

          {/* Amount Field */}
          <label className="font-medium">Amount (₹)</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 mt-1"
          />

          {/* Card Input */}
          <label className="font-medium">Card Details</label>
          <div className="border p-3 rounded-lg mb-4">
            <CardElement />
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={!stripe || processing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {processing ? "Processing..." : "Pay & Donate"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};



// ======================================================
// ⭐ Main Donation Component
// ======================================================
const Donation = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/events/getallevent",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEvents(res.data.events);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load events");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <p className="p-6">Loading events...</p>;

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-blue-700">
              🎓 Support Events with Donations
            </h2>

            <button
              onClick={fetchEvents}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FiRefreshCcw /> Refresh
            </button>
          </div>

          {/* Event Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <motion.div
                key={e._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/70 shadow-lg rounded-2xl p-5 border"
              >
                <h3 className="text-xl font-bold text-blue-700 mb-1">
                  {e.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3">{e.description}</p>

                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiCalendar className="text-blue-600" />
                  <span>{new Date(e.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiMapPin className="text-blue-600" />
                  <span>{e.location}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiClock className="text-blue-600" />
                  <span>{e.hours} hrs</span>
                </div>

                <div className="mt-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold">
                  Donation: {e.donationOpen ? "OPEN" : "CLOSED"}
                </div>

                <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                  Total Collected: ₹{e.totalCollected}
                </div>

                {e.donationOpen && (
                  <button
                    onClick={() => setSelectedEvent(e._id)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Donate Now
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedEvent && (
          <PaymentModal
            eventId={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </Elements>
  );
};

export default Donation;

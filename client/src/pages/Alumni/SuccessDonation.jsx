// src/pages/SuccessDonation.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const SuccessDonation = () => {
  const location = useLocation();

  // Prefer state (navigate state), fallback to query param
  const state = location.state || {};
  const amount = state.amount || new URLSearchParams(location.search).get("amount") || "—";
  const eventName = state.eventName || new URLSearchParams(location.search).get("eventName") || "the event";

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
        <FiCheckCircle size={84} className="text-green-600 mx-auto" />
        <h2 className="text-3xl font-bold mt-4 text-green-800">Thank you for your donation!</h2>

        <p className="text-md text-gray-600 mt-3">
          Your contribution of <span className="font-semibold">₹{amount}</span> to <span className="font-semibold">{eventName}</span> has been processed successfully.
        </p>

        <Link
          to="/alumnilayout/donations"
          className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold"
        >
          Back to Donations
        </Link>
      </div>
    </div>
  );
};

export default SuccessDonation;

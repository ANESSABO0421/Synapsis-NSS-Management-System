import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiMapPin, FiClock, FiRefreshCcw } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const ManageDonation = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch Coordinator Events
  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/my-events",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(res.data.events);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch events");
      setLoading(false);
    }
  };

  // Toggle donation open/close
  const toggleDonation = async (eventId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/coordinator/toggle-donation/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Donation status updated");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to toggle donation");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-700 text-center animate-pulse">
        Loading events...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-700">
            💰 Manage Donations
          </h2>

          <button
            onClick={fetchEvents}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
          >
            <FiRefreshCcw /> Refresh
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {events.length > 0 ? (
            events.map((e) => (
              <motion.div
                key={e._id}
                whileHover={{ scale: 1.03 }}
                className="
                  bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl 
                  p-4 sm:p-5 border border-green-100 hover:shadow-xl transition
                "
              >
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-2">
                  {e.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {e.description}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-700 mb-2 text-sm">
                  <FiCalendar className="text-green-600" />
                  <span>{new Date(e.date).toLocaleDateString()}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-700 mb-2 text-sm">
                  <FiMapPin className="text-green-600" />
                  <span>{e.location}</span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-2 text-gray-700 mb-2 text-sm">
                  <FiClock className="text-green-600" />
                  <span>{e.hours} hrs</span>
                </div>

                {/* Donation Status */}
                <div className="mt-3 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold">
                  Donation Open: {e.donationOpen ? "YES" : "NO"}
                </div>

                {/* Total Collected */}
                <div className="mt-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold">
                  Total Collected: ₹{e.totalCollected}
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleDonation(e._id)}
                  className={`
                    mt-4 w-full px-4 py-2 text-white rounded-lg font-semibold 
                    text-sm sm:text-base transition
                    ${
                      e.donationOpen
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  `}
                >
                  {e.donationOpen ? "Close Donation" : "Open Donation"}
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 italic">
              No events found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDonation;

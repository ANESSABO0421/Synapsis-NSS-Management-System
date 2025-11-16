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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEvents(res.data.events);
      setLoading(false);
    } catch (err) {
      console.log(err);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Donation status updated");
      fetchEvents(); // refresh UI
    } catch (err) {
      console.log(err);
      toast.error("Failed to toggle donation");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-700">Loading events...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-green-700">
            💰 Manage Donations
          </h2>

          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FiRefreshCcw /> Refresh
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((e) => (
              <motion.div
                key={e._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-5 border border-green-100 hover:shadow-xl transition"
              >
                {/* Event Title */}
                <h3 className="text-xl font-bold text-green-700 mb-1">
                  {e.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {e.description}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiCalendar className="text-green-600" />
                  <span>{new Date(e.date).toLocaleDateString()}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiMapPin className="text-green-600" />
                  <span>{e.location}</span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <FiClock className="text-green-600" />
                  <span>{e.hours} hrs</span>
                </div>

                {/* Donation Status */}
                <div className="mt-3 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold">
                  Donation Open: {e.donationOpen ? "YES" : "NO"}
                </div>

                {/* Total Collected */}
                <div className="mt-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold">
                  Total Collected: ₹{e.totalCollected}
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleDonation(e._id)}
                  className={`mt-4 w-full px-4 py-2 text-white rounded-lg font-semibold transition ${
                    e.donationOpen
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {e.donationOpen ? "Close Donation" : "Open Donation"}
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic col-span-full">
              No events found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDonation;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaCertificate,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaLeaf,
} from "react-icons/fa";

const StudentCertificate = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/api/students/my-events",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching student events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const handleGenerateCertificate = async (eventId) => {
    try {
      setDownloadingId(eventId);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:3000/api/students/generate/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate_${eventId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Certificate generation failed:", err);
      alert(
        "Unable to generate certificate. Please ensure the event is completed."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] text-emerald-600 text-lg font-semibold">
        <FaLeaf className="animate-spin text-3xl mb-2" />
        Loading your achievements...
      </div>
    );
  }

  const completedEvents = events.filter((e) => e.status === "Completed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-center text-emerald-700 mb-10 flex justify-center items-center gap-3"
      >
        <FaCertificate className="text-emerald-600" /> My Certificates
      </motion.h1>

      {completedEvents.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 text-lg"
        >
          No completed events yet. Participate in NSS activities to earn
          certificates 🌿
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {completedEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-emerald-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-emerald-800">
                  {event.title}
                </h2>
                <FaLeaf className="text-emerald-500 text-lg" />
              </div>

              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-600" />{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-600" />{" "}
                  {event.location || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FaClock className="text-emerald-600" /> {event.hours} hrs
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenerateCertificate(event._id)}
                disabled={downloadingId === event._id}
                className={`w-full mt-5 flex justify-center items-center gap-2 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
                  downloadingId === event._id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-600 hover:to-emerald-700"
                }`}
              >
                <FaCertificate className="text-white" />
                {downloadingId === event._id
                  ? "Generating..."
                  : "Download Certificate"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificate;

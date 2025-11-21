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
      alert("Unable to generate certificate. Please ensure the event is completed.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 text-emerald-600 text-lg font-semibold">
        <FaLeaf className="animate-spin text-3xl mb-2" />
        <p className="text-center text-sm sm:text-base">
          Loading your achievements...
        </p>
      </div>
    );
  }

  const completedEvents = events.filter((e) => e.status === "Completed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 p-4 sm:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          text-2xl sm:text-4xl font-extrabold text-center text-emerald-700 mb-6 sm:mb-10 
          flex justify-center items-center gap-2 sm:gap-3
        "
      >
        {/* <FaCertificate className="text-emerald-600 text-xl sm:text-3xl" /> */}
        My Certificates
      </motion.h1>

      {completedEvents.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 text-sm sm:text-lg px-4"
        >
          No completed events yet. Participate in NSS activities to earn
          certificates 🌿
        </motion.p>
      ) : (
        <div
          className="
            grid grid-cols-1 
            sm:grid-cols-2 
            xl:grid-cols-3 
            gap-4 sm:gap-6 lg:gap-8
          "
        >
          {completedEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                bg-white/80 backdrop-blur-md shadow-lg 
                rounded-2xl p-4 sm:p-6 
                border border-emerald-200 
                hover:shadow-2xl 
                hover:scale-[1.02] 
                transition-all duration-300
              "
            >
              {/* Title */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2
                  className="
                    text-lg sm:text-xl font-bold text-emerald-800 
                    max-w-[75%] truncate
                  "
                >
                  {event.title}
                </h2>
                {/* <FaLeaf className="text-emerald-500 text-base sm:text-lg" /> */}
              </div>

              {/* Event Info */}
              <div className="space-y-2 text-gray-700 text-xs sm:text-sm">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-600" />
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-600" />
                  {event.location || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FaClock className="text-emerald-600" />
                  {event.hours} hrs
                </p>
              </div>

              {/* Download Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenerateCertificate(event._id)}
                disabled={downloadingId === event._id}
                className={`
                  w-full mt-4 sm:mt-5 
                  flex justify-center items-center gap-2 
                  py-2.5 rounded-lg 
                  font-semibold text-white shadow-md transition-all 
                  text-sm sm:text-base
                  ${
                    downloadingId === event._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-600 hover:to-emerald-700"
                  }
                `}
              >
                <FaCertificate className="text-white" />
                {downloadingId === event._id ? "Generating..." : "Download Certificate"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificate;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCertificate, FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const StudentCertificate = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/students/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data.events)
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

      const response = await axios.get(`http://localhost:3000/api/students/generate/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for downloading files
      });

      // Create a temporary link to trigger download
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] text-gray-500 text-lg">
        Loading your events...
      </div>
    );
  }

  const completedEvents = events.filter((e) => e.status === "Completed");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        🎓 My Certificates
      </h1>

      {completedEvents.length === 0 ? (
        <p className="text-center text-gray-500">
          No completed events yet. Participate in events to earn certificates!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow-lg rounded-2xl p-5 border hover:shadow-xl transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {event.title}
              </h2>
              <p className="text-gray-600 mb-2 flex items-center gap-2">
                <FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt /> {event.location}
              </p>
              <p className="text-gray-600 mb-4 flex items-center gap-2">
                <FaClock /> {event.hours} hrs
              </p>

              <button
                onClick={() => handleGenerateCertificate(event._id)}
                disabled={downloadingId === event._id}
                className={`w-full flex justify-center items-center gap-2 py-2 rounded-lg text-white font-medium ${
                  downloadingId === event._id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } transition`}
              >
                <FaCertificate />
                {downloadingId === event._id
                  ? "Generating..."
                  : "Generate Certificate"}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificate;

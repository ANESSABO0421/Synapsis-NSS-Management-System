import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClipboardList,
  FaLock,
  FaFilePdf,
} from "react-icons/fa";

const GeneratePdfTeacher = () => {
  const [events, setEvents] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const API_BASE = "http://localhost:3000/api"; // Update if needed

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/teacher/teachermyevents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setEvents(res.data.data || []);
        else toast.error(res.data.message || "No events found");
      } catch {
        toast.error("Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  const handleGeneratePdf = async (event) => {
    if (event.status !== "Completed") {
      return toast.warning("PDF can only be generated for completed events!");
    }

    setLoadingId(event._id);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/teacher/attendance/pdf/${event._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, "_")}_attendance.pdf`;
      a.click();
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-10">
      <h2 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-green-700 to-emerald-500 text-transparent bg-clip-text">
        📄 Generate Attendance Report
      </h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {events.length === 0 ? (
          <p className="text-center col-span-full text-gray-500 text-lg">
            No events available yet.
          </p>
        ) : (
          events.map((event) => {
            const isCompleted = event.status === "Completed";
            return (
              <motion.div
                key={event._id}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`relative overflow-hidden bg-white shadow-lg rounded-2xl border transition-all duration-300 
                  ${
                    isCompleted
                      ? "border-green-300 hover:shadow-green-200"
                      : "border-gray-200 opacity-90"
                  }
                `}
              >
                {/* Top Gradient Strip */}
                <div
                  className={`h-2 w-full ${
                    isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gray-300"
                  }`}
                ></div>

                <div className="p-6 flex flex-col justify-between h-full">
                  {/* Event Title */}
                  <h3 className="text-2xl font-bold text-green-800 truncate mb-3">
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="text-gray-600 space-y-2 text-sm mb-6">
                    <p className="flex items-center gap-2">
                      <FaCalendarAlt className="text-green-500" />{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-500" /> {event.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClipboardList className="text-green-500" />{" "}
                      {event.description || "NSS Activity"}
                    </p>
                  </div>

                  {/* Status + Action */}
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.status}
                    </span>

                    <button
                      onClick={() => handleGeneratePdf(event)}
                      disabled={!isCompleted || loadingId === event._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 ${
                        isCompleted
                          ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-green-200 hover:scale-105"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {loadingId === event._id ? (
                        "Generating..."
                      ) : isCompleted ? (
                        <>
                          <FaFilePdf /> Generate
                        </>
                      ) : (
                        <>
                          <FaLock /> Locked
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Decorative Glow for Completed Events */}
                {isCompleted && (
                  <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-green-100/20 to-transparent blur-2xl"></div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GeneratePdfTeacher;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaSpinner,
} from "react-icons/fa";

const StudentAttendance = () => {
  const [events, setEvents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/students/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const attendanceMap = {};
      for (const ev of events) {
        try {
          const res = await axios.get(
            `http://localhost:3000/api/students/event/${ev._id}/attendance`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          attendanceMap[ev._id] = res.data.attendance;
        } catch {
          attendanceMap[ev._id] = null;
        }
      }
      setAttendanceData(attendanceMap);
    };

    if (events.length > 0) fetchAttendance();
  }, [events, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-green-700 text-lg font-medium">
        <FaSpinner className="animate-spin mr-2 text-green-600" /> Loading attendance records...
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] p-8 bg-gradient-to-b from-emerald-50 via-white to-green-100 rounded-2xl">
      <h1 className="text-4xl font-extrabold text-center text-green-800 mb-12">
        🧾 Attendance Overview
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          You haven’t participated in any events yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const attendance = attendanceData[event._id];
            const status = attendance?.status || "Not Marked";

            // Status-specific styles
            const statusInfo = {
              Present: {
                icon: <FaUserCheck />,
                color: "text-green-600",
                bg: "bg-green-100 border-green-300",
              },
              Absent: {
                icon: <FaUserTimes />,
                color: "text-red-600",
                bg: "bg-red-100 border-red-300",
              },
              "Not Marked": {
                icon: <FaUserClock />,
                color: "text-gray-500",
                bg: "bg-gray-100 border-gray-300",
              },
            }[status] || {
              icon: <FaUserClock />,
              color: "text-gray-500",
              bg: "bg-gray-100 border-gray-300",
            };

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/70 backdrop-blur-xl border border-emerald-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-emerald-800 truncate">
                    {event.title}
                  </h2>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {statusInfo.icon}
                    {status}
                  </div>
                </div>

                {/* Details */}
                <div className="text-gray-700 space-y-2 mb-4 text-sm">
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-emerald-500" />
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    {event.location || "Location not available"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock className="text-emerald-500" />
                    Duration: {event.hours || 0} hrs
                  </p>
                </div>

                {/* Attendance Details */}
                <div className="border-t pt-3 text-xs text-gray-600 space-y-1">
                  {attendance ? (
                    <>
                      <p>
                        <span className="font-medium text-gray-800">Marked By:</span>{" "}
                        {attendance.markedBy?.name || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Marked On:</span>{" "}
                        {attendance.date
                          ? new Date(attendance.date).toLocaleString()
                          : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p className="italic text-gray-400">
                      Attendance not marked yet.
                    </p>
                  )}
                </div>

                {/* Subtle accent bar */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-1.5 transition-all ${
                    status === "Present"
                      ? "bg-green-500/70"
                      : status === "Absent"
                      ? "bg-red-400/70"
                      : "bg-gray-300/70"
                  }`}
                ></div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;

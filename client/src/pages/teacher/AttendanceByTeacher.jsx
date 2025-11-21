import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaCalendarAlt, FaClipboardList } from "react-icons/fa";

const AttendanceByTeacher = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api";

  // ✅ Fetch events for logged-in teacher
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

  // ✅ Select event and fetch volunteers
  const handleSelectEvent = async (eventId) => {
    setSelectedEvent(events.find((e) => e._id === eventId));
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/events/participantsofevents/${eventId}`);
      if (res.data.success) {
        const participants = res.data.participants || [];
        setStudents(participants);
        const initialAttendance = {};
        participants.forEach((s) => (initialAttendance[s._id] = "Present"));
        setAttendance(initialAttendance);
      } else toast.error("No volunteers found");
    } catch {
      toast.error("Error loading volunteers");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change attendance for each student
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // ✅ Submit attendance
  const handleSubmit = async () => {
    if (!selectedEvent) return toast.error("Select an event first");
    try {
      const token = localStorage.getItem("token");
      const attendanceList = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      const res = await axios.post(
        `${API_BASE}/teacher/attendance/${selectedEvent._id}`,
        { attendanceList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) toast.success("✅ Attendance submitted successfully!");
      else toast.error(res.data.message);
    } catch {
      toast.error("Failed to mark attendance");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <h2 className="text-4xl font-bold text-center mb-10 text-green-800">
        Event Attendance Portal
      </h2>

      {/* 🎯 Step 1: Select Event */}
      <AnimatePresence>
        {!selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {events.length === 0 ? (
              <p className="text-center col-span-full text-gray-600">
                No events assigned yet.
              </p>
            ) : (
              events.map((event) => (
                <motion.div
                  key={event._id}
                  onClick={() => handleSelectEvent(event._id)}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer bg-white/80 backdrop-blur-md shadow-md border border-green-200 rounded-2xl p-5 hover:shadow-xl transition-all"
                >
                  <h3 className="text-xl font-semibold text-green-800 truncate">
                    {event.title}
                  </h3>
                  <div className="text-gray-600 mt-2 space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt /> {event.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClipboardList /> {event.status}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition">
                      Select Event
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 Step 2: Mark Attendance */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[85vh]"
            >
              <h3 className="text-2xl font-semibold mb-4 text-center text-green-700">
                Mark Attendance - {selectedEvent.title}
              </h3>

              <div className="text-center mb-2 text-sm text-gray-500">
                📅 {new Date(selectedEvent.date).toLocaleDateString()} • 📍{" "}
                {selectedEvent.location}
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-10">Loading volunteers...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg">
                    <thead className="bg-green-100 text-green-800">
                      <tr>
                        <th className="p-2 border">#</th>
                        <th className="p-2 border text-left">Name</th>
                        <th className="p-2 border text-left hidden sm:table-cell">
                          Department
                        </th>
                        <th className="p-2 border text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr
                          key={s._id}
                          className="hover:bg-green-50 transition text-gray-700"
                        >
                          <td className="p-2 border text-center">{i + 1}</td>
                          <td className="p-2 border">{s.name}</td>
                          <td className="p-2 border hidden sm:table-cell">
                            {s.department || "-"}
                          </td>
                          <td className="p-2 border text-center">
                            <select
                              value={attendance[s._id] || "Present"}
                              onChange={(e) =>
                                handleAttendanceChange(s._id, e.target.value)
                              }
                              className="border rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-green-400"
                            >
                              <option value="Present">✅ Present</option>
                              <option value="Absent">❌ Absent</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ✅ Only Submit & Close buttons now */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  ✅ Submit Attendance
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceByTeacher;

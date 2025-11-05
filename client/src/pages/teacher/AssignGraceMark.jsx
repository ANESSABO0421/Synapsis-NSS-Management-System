import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaUserGraduate,
  FaClipboardCheck,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const AssignGraceMark = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [participants, setParticipants] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/teacher/teachermyevents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const completedEvents =
          res.data.data?.filter((e) => e.status === "Completed") || [];
        setEvents(completedEvents);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch events");
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!selectedEvent) return;
      try {
        const res = await axios.get(
          `${API_BASE}/events/participantsofevents/${selectedEvent}`
        );
        const list = res.data.participants || [];
        setParticipants(list);

        // build marks map
        const marksObj = {};
        list.forEach((p) => {
          marksObj[p._id] =
            p.graceMarks && !isNaN(p.graceMarks) ? p.graceMarks : "";
        });
        setMarks(marksObj);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch participants");
      }
    };
    fetchParticipants();
  }, [selectedEvent]);

  const handleAssignOrUpdate = async (studentId, type) => {
    const studentMarks = marks[studentId];
    if (studentMarks === "" || studentMarks === undefined) {
      toast.warn("Enter valid marks first!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        studentId,
        eventId: selectedEvent,
        marks: Number(studentMarks),
      };

      if (type === "assign") {
        await axios.post(`${API_BASE}/teacher/grace-marks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Grace marks assigned ✅");
      } else {
        await axios.put(
          `${API_BASE}/teacher/grace-marks/${studentId}`,
          { marks: Number(studentMarks) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Grace marks updated 🔄");
      }
    } catch (err) {
      console.error(err);
      toast.error("the mark is assigned for the event already");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Delete this student's grace marks?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/teacher/grace-marks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMarks({ ...marks, [studentId]: "" });
      toast.success("Grace marks deleted 🗑️");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete grace marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-green-800 text-center mb-10"
      >
        🌱 Manage Grace Marks
      </motion.h1>

      {/* Event Selector */}
      <div className="max-w-2xl mx-auto mb-10 bg-white p-6 rounded-xl shadow-md border border-green-100">
        <label className="block text-lg font-semibold mb-3 text-green-700">
          Select Completed Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full p-3 rounded-lg border border-green-300 shadow-sm focus:ring-2 focus:ring-green-500 bg-white transition-all"
        >
          <option value="">-- Select Event --</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {/* Participants Table */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-2xl rounded-2xl p-6 max-w-6xl mx-auto border border-green-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaClipboardCheck className="text-green-600 text-2xl" />
            <h2 className="text-2xl font-semibold text-green-700">
              Event Participants
            </h2>
          </div>

          {participants.length === 0 ? (
            <p className="text-gray-600 text-center py-6">
              No participants found for this event.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-xl text-sm md:text-base">
                <thead>
                  <tr className="bg-green-100 text-green-800">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-center">Current</th>
                    <th className="px-4 py-2 text-center">New Marks</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((student) => (
                    <motion.tr
                      key={student._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t hover:bg-green-50 transition-all"
                    >
                      <td className="px-4 py-2 flex items-center gap-2 font-medium text-gray-800">
                        <FaUserGraduate className="text-green-600" />
                        {student.name}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-4 py-2 text-center font-semibold text-green-700">
                        {student.graceMarks ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={marks[student._id] ?? ""}
                          onChange={(e) =>
                            setMarks({
                              ...marks,
                              [student._id]: e.target.value,
                            })
                          }
                          className="w-24 border border-green-300 rounded-md p-1 text-center focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() =>
                            handleAssignOrUpdate(student._id, "assign")
                          }
                          disabled={loading}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() =>
                            handleAssignOrUpdate(student._id, "update")
                          }
                          disabled={loading}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          disabled={loading}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AssignGraceMark;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserGraduate, FaClipboardCheck, FaEdit, FaTrash } from "react-icons/fa";

const AssignGraceMark = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [participants, setParticipants] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/teacher/teachermyevents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.data.filter((e) => e.status === "Completed"));
      } catch (err) {
        toast.error("Failed to load events");
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!selectedEvent) return;

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/teacher/participantsofevents/${selectedEvent}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const list = res.data.participants || [];
        setParticipants(list);

        const marksObj = {};

        list.forEach((student) => {
          const record = student.graceHistory?.find((h) => {
            const id = h.eventId?._id || h.eventId;
            return id === selectedEvent;
          });

          marksObj[student._id] = record ? record.marks : "";
        });

        setMarks(marksObj);
      } catch (err) {
        toast.error("Failed to load participants");
      }
    };

    loadParticipants();
  }, [selectedEvent]);

  const refresh = async () => {
    if (!selectedEvent) return;

    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_BASE}/teacher/participantsofevents/${selectedEvent}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const list = res.data.participants || [];
    setParticipants(list);

    const marksObj = {};

    list.forEach((student) => {
      const record = student.graceHistory?.find((h) => {
        const id = h.eventId?._id || h.eventId;
        return id === selectedEvent;
      });
      marksObj[student._id] = record ? record.marks : "";
    });

    setMarks(marksObj);
  };

  const applyMarks = async (studentId, type) => {
    const value = marks[studentId];

    if (value === "" || isNaN(value)) {
      toast.warn("Enter valid marks");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (type === "assign") {
        await axios.post(
          `${API_BASE}/teacher/grace-marks`,
          { studentId, eventId: selectedEvent, marks: Number(value) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Assigned");
      } else {
        await axios.put(
          `${API_BASE}/teacher/update/${studentId}/${selectedEvent}`,
          { marks: Number(value) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Updated");
      }

      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }

    setLoading(false);
  };

  const deleteMarks = async (studentId) => {
    if (!window.confirm("Delete marks for this event?")) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE}/teacher/delete/${studentId}/${selectedEvent}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Deleted");
      await refresh();
    } catch (err) {
      toast.error("Failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 bg-green-50 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-green-800 text-center mb-10"
      >
        🌱 Manage Event-wise Grace Marks
      </motion.h1>

      <div className="max-w-xl mx-auto bg-white p-5 rounded-lg shadow">
        <select
          className="w-full p-3 border rounded-lg"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Select Completed Event</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div className="max-w-6xl mx-auto mt-8 bg-white shadow rounded-lg p-4 overflow-x-auto">
          <table className="w-full min-w-[800px] border">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2 text-center">Current</th>
                <th className="p-2 text-center">New Marks</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {participants.map((s) => {
                const record = s.graceHistory?.find((h) => {
                  const id = h.eventId?._id || h.eventId;
                  return id === selectedEvent;
                });

                const current = record ? record.marks : "—";

                return (
                  <tr key={s._id} className="border-b hover:bg-green-50">
                    <td className="p-2 flex items-center gap-2">
                      <FaUserGraduate className="text-green-600" />
                      {s.name}
                    </td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2 text-center">{current}</td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        value={marks[s._id]}
                        onChange={(e) =>
                          setMarks({ ...marks, [s._id]: e.target.value })
                        }
                        className="w-20 p-1 border rounded text-center"
                      />
                    </td>
                    <td className="p-2 text-center space-x-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => applyMarks(s._id, "assign")}
                      >
                        Assign
                      </button>

                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => applyMarks(s._id, "update")}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => deleteMarks(s._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {participants.length === 0 && (
            <p className="text-center text-gray-600 py-4">
              No participants found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignGraceMark;

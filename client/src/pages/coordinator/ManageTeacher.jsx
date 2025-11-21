import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiUserPlus,
  FiTrash2,
} from "react-icons/fi";
import { motion } from "framer-motion";

const ManageTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/teachers",
        axiosConfig
      );
      setTeachers(res.data.teachers || []);
    } catch (error) {
      console.error("Teacher Fetch Error:", error);
      toast.error("Failed to fetch teachers");
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/events",
        axiosConfig
      );
      setEvents(res.data.events || []);
    } catch (error) {
      console.error("Event Fetch Error:", error);
      toast.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchEvents();
  }, []);

  // Assign teacher
  const handleAssign = async () => {
    if (!selectedTeacher || !selectedEvent) {
      toast.warning("Please select both teacher and event");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/coordinator/assign-teacher",
        {
          eventId: selectedEvent,
          teacherIds: [selectedTeacher],
        },
        axiosConfig
      );

      toast.success(res.data.message || "Teacher assigned successfully!");
      setSelectedTeacher("");
      setSelectedEvent("");
      fetchEvents();
    } catch (error) {
      console.error("Assign Teacher Error:", error);
      toast.error(error.response?.data?.message || "Error assigning teacher");
    } finally {
      setLoading(false);
    }
  };

  // Unassign Teacher
  const handleUnassign = async (eventId, teacherId) => {
    try {
      setUnassigning(true);
      const res = await axios.delete(
        "http://localhost:3000/api/coordinator/unassign-teacher",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { eventId, teacherId },
        }
      );

      toast.success(res.data.message || "Teacher unassigned successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Unassign Teacher Error:", error);
      toast.error(error.response?.data?.message || "Error unassigning teacher");
    } finally {
      setUnassigning(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center gap-2">
          <FiUser className="text-green-600" /> Manage Teachers
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Assign or unassign teachers to events.
        </p>
      </motion.div>

      {/* Assignment Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-lg border border-green-100 rounded-2xl p-4 sm:p-6 mb-10"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <FiUserPlus className="text-green-600" /> Assign Teacher to Event
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Select Teacher */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Choose Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          {/* Select Event */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Select Event
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Choose Event</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assign Button */}
          <div className="flex items-end">
            <button
              onClick={handleAssign}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md text-sm"
            >
              <FiCheckCircle />
              {loading ? "Assigning..." : "Assign Teacher"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Assigned Teachers Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-md rounded-2xl p-4 sm:p-6 border border-green-100"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FiCalendar className="text-green-600" /> Assigned Events
        </h3>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No events found. Please assign a teacher.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-100 text-green-800 text-xs sm:text-sm">
                  <th className="px-4 sm:px-6 py-3 border-b text-left font-semibold">
                    Event
                  </th>
                  <th className="px-4 sm:px-6 py-3 border-b text-left font-semibold">
                    Teachers
                  </th>
                  <th className="px-4 sm:px-6 py-3 border-b text-left font-semibold">
                    Departments
                  </th>
                  <th className="px-4 sm:px-6 py-3 border-b text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.map((event, idx) => (
                  <motion.tr
                    key={event._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-green-50 border-b"
                  >
                    <td className="px-4 sm:px-6 py-3 text-gray-800 font-medium">
                      {event.title}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-gray-700">
                      {event.assignedTeacher?.length
                        ? event.assignedTeacher.map((t) => t.name).join(", ")
                        : "Not Assigned"}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-gray-600">
                      {event.assignedTeacher?.length
                        ? event.assignedTeacher
                            .map((t) => t.department)
                            .join(", ")
                        : "-"}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-center">
                      {event.assignedTeacher?.length ? (
                        event.assignedTeacher.map((teacher) => (
                          <button
                            key={teacher._id}
                            disabled={unassigning}
                            onClick={() =>
                              handleUnassign(event._id, teacher._id)
                            }
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200 inline-flex items-center gap-1 mr-2"
                          >
                            <FiTrash2 size={13} />
                            {unassigning ? "…" : "Unassign"}
                          </button>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManageTeacher;

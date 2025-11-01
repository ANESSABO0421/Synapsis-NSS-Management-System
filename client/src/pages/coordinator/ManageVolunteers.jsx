import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiUserPlus,
  FiUserMinus,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";

const ManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [assignedVolunteers, setAssignedVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch volunteers
  const fetchVolunteers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/volunteers",
        axiosConfig
      );
      setVolunteers(res.data.volunteers || []);
    } catch (error) {
      console.error("Volunteer Fetch Error:", error);
      toast.error("Failed to fetch volunteers");
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/my-events",
        axiosConfig
      );
      setEvents(res.data.events || []);
    } catch (error) {
      console.error("Event Fetch Error:", error);
      toast.error("Failed to fetch events");
    }
  };

  // Fetch assigned volunteers for a selected event
  const fetchAssignedVolunteers = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/api/coordinator/events/${eventId}`,
        axiosConfig
      );
      const assigned = res.data?.event?.participants || [];
      setAssignedVolunteers(assigned);
    } catch (error) {
      console.error("Assigned Fetch Error:", error);
      setAssignedVolunteers([]);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
  }, []);

  // refetch assigned volunteers when event changes
  useEffect(() => {
    fetchAssignedVolunteers(selectedEvent);
    setSelectedVolunteers([]);
  }, [selectedEvent]);

  const handleVolunteerSelection = (id) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // Assign volunteers
  const handleAssign = async () => {
    if (!selectedEvent || selectedVolunteers.length === 0) {
      toast.warning("Please select an event and at least one volunteer");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/coordinator/assignvolunteertoevents",
        {
          eventId: selectedEvent,
          volunteerIds: selectedVolunteers,
        },
        axiosConfig
      );
      toast.success(res.data.message || "Volunteers assigned successfully!");
      setSelectedVolunteers([]);
      fetchAssignedVolunteers(selectedEvent);
    } catch (error) {
      console.error("Assign Error:", error);
      toast.error(error.response?.data?.message || "Error assigning volunteers");
    } finally {
      setLoading(false);
    }
  };

  // Unassign volunteers
  const handleUnassign = async () => {
    if (!selectedEvent || selectedVolunteers.length === 0) {
      toast.warning("Please select an event and volunteers to unassign");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/coordinator/unassign-volunteers",
        {
          eventId: selectedEvent,
          volunteerIds: selectedVolunteers,
        },
        axiosConfig
      );
      toast.success(res.data.message || "Volunteers unassigned successfully!");
      setSelectedVolunteers([]);
      fetchAssignedVolunteers(selectedEvent);
    } catch (error) {
      console.error("Unassign Error:", error);
      toast.error(error.response?.data?.message || "Error unassigning volunteers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-green-700 flex items-center gap-3">
          <FiUsers className="text-green-600" /> Manage Volunteers
        </h2>
        <p className="text-gray-500 mt-2">
          Assign or unassign volunteers to events easily.
        </p>
      </motion.div>

      {/* Assignment Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-lg border border-green-100 rounded-2xl p-6 mb-10 hover:shadow-xl transition-all"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <FiCalendar className="text-green-600" /> Event Volunteer Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Select Event */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Select Event
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAssign}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md"
            >
              <FiUserPlus />
              {loading ? "Assigning..." : "Assign Volunteers"}
            </motion.button>
          </div>

          {/* Unassign Button */}
          <div className="flex items-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUnassign}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-md"
            >
              <FiUserMinus />
              {loading ? "Processing..." : "Unassign Volunteers"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Volunteers Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-md rounded-2xl p-6 border border-green-100"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <FiUsers className="text-green-600" /> Available Volunteers
        </h3>

        {volunteers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No volunteers found for your institution.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-100 text-green-800">
                  <th className="px-6 py-3 border-b text-left font-semibold">
                    Select
                  </th>
                  <th className="px-6 py-3 border-b text-left font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 border-b text-left font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 border-b text-left font-semibold">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v, index) => {
                  const alreadyAssigned = assignedVolunteers.some(
                    (a) => a._id === v._id
                  );

                  return (
                    <motion.tr
                      key={v._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b ${
                        alreadyAssigned ? "bg-gray-100 opacity-60" : "hover:bg-green-50"
                      }`}
                    >
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedVolunteers.includes(v._id)}
                          onChange={() => handleVolunteerSelection(v._id)}
                          className="w-4 h-4 accent-green-600"
                          disabled={alreadyAssigned}
                        />
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {v.name}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{v.email}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {v.department || "—"}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManageVolunteers;

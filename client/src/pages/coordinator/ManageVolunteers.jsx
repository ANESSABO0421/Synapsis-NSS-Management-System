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
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch volunteers
  const fetchVolunteers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/volunteers",
        axiosConfig
      );
      setVolunteers(res.data.volunteers || []);
    } catch (error) {
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
      toast.error("Failed to fetch events");
    }
  };

  const fetchAssignedVolunteers = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/api/coordinator/events/${eventId}`,
        axiosConfig
      );
      setAssignedVolunteers(res.data?.event?.participants || []);
    } catch (error) {
      setAssignedVolunteers([]);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchAssignedVolunteers(selectedEvent);
    setSelectedVolunteers([]);
  }, [selectedEvent]);

  const handleVolunteerSelection = (id) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // Assign Volunteers
  const handleAssign = async () => {
    if (!selectedEvent || selectedVolunteers.length === 0) {
      toast.warning("Select an event and at least one volunteer");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3000/api/coordinator/assignvolunteertoevents",
        { eventId: selectedEvent, volunteerIds: selectedVolunteers },
        axiosConfig
      );
      toast.success("Volunteers assigned successfully!");
      setSelectedVolunteers([]);
      fetchAssignedVolunteers(selectedEvent);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign volunteers");
    } finally {
      setLoading(false);
    }
  };

  // Unassign Volunteers
  const handleUnassign = async () => {
    if (!selectedEvent || selectedVolunteers.length === 0) {
      toast.warning("Select an event and volunteers to unassign");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3000/api/coordinator/unassign-volunteers",
        { eventId: selectedEvent, volunteerIds: selectedVolunteers },
        axiosConfig
      );
      toast.success("Volunteers unassigned successfully!");
      setSelectedVolunteers([]);
      fetchAssignedVolunteers(selectedEvent);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unassign volunteers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-green-50 min-h-screen">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center gap-2">
          <FiUsers className="text-green-600" /> Manage Volunteers
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Assign or unassign volunteers to events easily.
        </p>
      </motion.div>

      {/* ASSIGNMENT PANEL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white shadow-md rounded-2xl border border-green-100 p-5 sm:p-6 mb-8"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <FiCalendar className="text-green-600" /> Event Volunteer Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Select Event */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Select Event
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 text-sm sm:text-base focus:ring-green-500"
            >
              <option value="">Choose Event</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assign */}
          <div className="flex items-end">
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              onClick={handleAssign}
              className="w-full bg-green-600 text-white py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2"
            >
              <FiUserPlus /> {loading ? "Assigning..." : "Assign"}
            </motion.button>
          </div>

          {/* Unassign */}
          <div className="flex items-end">
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              onClick={handleUnassign}
              className="w-full bg-red-600 text-white py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-red-700 transition flex justify-center items-center gap-2"
            >
              <FiUserMinus /> {loading ? "Processing..." : "Unassign"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* VOLUNTEER TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border shadow-md rounded-2xl p-4 sm:p-6"
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
          <FiUsers className="text-green-600" /> Available Volunteers
        </h3>

        {volunteers.length === 0 ? (
          <p className="text-gray-500 py-5 text-center">
            No volunteers found in your institution.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-green-100 text-green-800 text-xs sm:text-sm">
                  <th className="px-4 sm:px-6 py-3 text-left">Select</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left">Department</th>
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
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`border-b ${
                        alreadyAssigned ? "bg-gray-100 opacity-60" : "hover:bg-green-50"
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
                          disabled={alreadyAssigned}
                          checked={selectedVolunteers.includes(v._id)}
                          onChange={() => handleVolunteerSelection(v._id)}
                        />
                      </td>

                      <td className="px-4 sm:px-6 py-3 font-medium">{v.name}</td>

                      {/* Hide email completely on extra small screens */}
                      <td className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                        {v.email}
                      </td>

                      <td className="px-4 sm:px-6 py-3">{v.department}</td>
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

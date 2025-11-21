import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiX,
  FiRefreshCcw,
} from "react-icons/fi";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    hours: "",
    status: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/my-events",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(res.data.events);
    } catch (err) {
      toast.error("Failed to fetch events");
    }
  };

  const handleStart = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/events/${id}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Event started successfully!");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to start event");
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/events/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Event marked as completed!");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to complete event");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date?.split("T")[0] || "",
      hours: event.hours,
      status: event.status,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/api/coordinator/events/${editingEvent._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Event updated successfully!");
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error("Failed to update event");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-700">
            📅 Manage Events
          </h2>

          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
          >
            <FiRefreshCcw /> Refresh
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((e) => (
              <motion.div
                key={e._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 rounded-2xl shadow-lg p-5 border border-green-100 hover:shadow-xl transition"
              >
                <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-1">
                  {e.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {e.description}
                </p>

                {/* Event Info */}
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiCalendar className="text-green-600" />
                    <span>{new Date(e.date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <FiMapPin className="text-green-600" />
                    <span>{e.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <FiClock className="text-green-600" />
                    <span>{e.hours} hrs</span>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    e.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : e.status === "Ongoing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {e.status}
                </span>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
                  {e.status === "Upcoming" && (
                    <button
                      onClick={() => handleStart(e._id)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Start
                    </button>
                  )}

                  {e.status === "Ongoing" && (
                    <button
                      onClick={() => handleComplete(e._id)}
                      className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(e)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    <FiEdit2 /> Edit
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic col-span-full">
              No events found.
            </p>
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingEvent && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl w-[90%] sm:w-[450px] relative"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
              >
                <button
                  onClick={() => setEditingEvent(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                >
                  <FiX size={22} />
                </button>

                <h3 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">
                  Edit Event
                </h3>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  />

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows="3"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  />

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  />

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  />

                  <input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    placeholder="Hours"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  />

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 text-sm"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageEvents;

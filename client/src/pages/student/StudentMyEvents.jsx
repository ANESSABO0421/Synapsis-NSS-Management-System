import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaSyncAlt,
  FaUserTie,
  FaUserShield,
  FaSchool,
  FaInfoCircle,
  FaBookReader,
  FaPhoneAlt,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "react-toastify";

const StudentMyEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/students/events/filter", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.events || [];
      setEvents(data);
      setFilteredEvents(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch events");
      setLoading(false);
    }
  };

  // Filter by Status
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    if (value === "All") setFilteredEvents(events);
    else setFilteredEvents(events.filter((ev) => ev.status === value));
  };

  // Initial Fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Hide Scrollbar when Modal Open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [selectedEvent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 drop-shadow-sm tracking-tight text-center sm:text-left">
           My NSS Events
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="border border-green-400 bg-white/70 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-1/2 sm:w-auto"
          >
            <option value="All">All</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={fetchEvents}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm sm:text-base"
          >
            <FaSyncAlt className="animate-spin-slow" /> Refresh
          </button>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center text-gray-500 mt-16 animate-pulse text-lg">
          Loading your events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center text-gray-500 mt-16 text-lg">
          No events found for this filter.
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8"
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event._id || event.id || Math.random()}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelectedEvent(event)}
              className="cursor-pointer bg-white/70 backdrop-blur-lg shadow-lg border border-green-100 rounded-3xl p-5 sm:p-6 transition-all hover:shadow-green-300 hover:border-green-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
                {event.title}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-green-600 flex-shrink-0" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-600 flex-shrink-0" />{" "}
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-green-600 flex-shrink-0" />{" "}
                  {event.hours} hrs
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span
                  className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                    event.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : event.status === "Ongoing"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.status}
                </span>
                <FaInfoCircle className="text-green-600 text-base sm:text-lg" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md sm:max-w-2xl p-6 sm:p-8 relative overflow-hidden"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-5 text-gray-500 hover:text-red-500 text-2xl font-bold"
              >
                ×
              </button>

              <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2">
                {/* Title & Desc */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-green-700">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Event Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-green-600" />
                    <span>{selectedEvent.hours} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBookReader className="text-green-600" />
                    <span>Status: {selectedEvent.status}</span>
                  </div>
                </div>

                <hr className="my-4 border-green-200" />

                {/* Teachers */}
                <div>
                  <h3 className="font-semibold text-green-700 flex items-center gap-2 text-lg">
                    <FaUserTie /> Teacher(s)
                  </h3>
                  {Array.isArray(selectedEvent.teacher) &&
                  selectedEvent.teacher.length > 0 ? (
                    selectedEvent.teacher.map((t, idx) => (
                      <div
                        key={idx}
                        className="ml-4 sm:ml-6 bg-green-50/60 rounded-lg p-2 mt-2 text-sm"
                      >
                        <p className="font-medium">{t.name}</p>
                        <p className="text-gray-500">{t.email}</p>
                        {t.phoneNumber && (
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaPhoneAlt className="text-green-500" /> {t.phoneNumber}
                          </p>
                        )}
                        {t.department && (
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaBuilding className="text-green-500" /> {t.department}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="ml-6 text-gray-500 text-sm">No teacher assigned</p>
                  )}
                </div>

                {/* Coordinator */}
                <div>
                  <h3 className="font-semibold text-green-700 flex items-center gap-2 text-lg mt-4">
                    <FaUserShield /> Coordinator
                  </h3>
                  {selectedEvent.coordinator ? (
                    <div className="ml-4 sm:ml-6 bg-green-50/60 rounded-lg p-2 mt-2 text-sm">
                      <p className="font-medium">{selectedEvent.coordinator.name}</p>
                      <p className="text-gray-500">{selectedEvent.coordinator.email}</p>
                      {selectedEvent.coordinator.phoneNumber && (
                        <p className="text-gray-500 flex items-center gap-1">
                          <FaPhoneAlt className="text-green-500" />{" "}
                          {selectedEvent.coordinator.phoneNumber}
                        </p>
                      )}
                      {selectedEvent.coordinator.department && (
                        <p className="text-gray-500 flex items-center gap-1">
                          <FaBuilding className="text-green-500" />{" "}
                          {selectedEvent.coordinator.department}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="ml-6 text-gray-500 text-sm">
                      No coordinator assigned
                    </p>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <h3 className="font-semibold text-green-700 flex items-center gap-2 text-lg mt-4">
                    <FaSchool /> Institution
                  </h3>
                  {selectedEvent.institution ? (
                    <div className="ml-4 sm:ml-6 bg-green-50/60 rounded-lg p-2 mt-2 text-sm">
                      <p className="font-medium">
                        {selectedEvent.institution.name}
                      </p>
                      <p className="text-gray-500">
                        {selectedEvent.institution.address}
                      </p>
                    </div>
                  ) : (
                    <p className="ml-6 text-gray-500 text-sm">No institution details</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentMyEvents;

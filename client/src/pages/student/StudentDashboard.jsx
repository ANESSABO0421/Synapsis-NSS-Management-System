import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay, parseISO } from "date-fns";
import {
  FaAward,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/students/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setDashboard(res.data.dashboard);
        } else {
          toast.error("Failed to load dashboard");
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
        toast.error("Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  if (!dashboard) {
    return <div className="text-center mt-10 text-red-500">No data available</div>;
  }

  const {
    student,
    stats: { totalEvents, completedEvents, totalHours, graceMarks },
    assignedEvents,
  } = dashboard;

  const upcomingEvents = assignedEvents.filter(
    (ev) => new Date(ev.date) >= new Date()
  );

  const eventsForSelectedDate = upcomingEvents.filter((ev) =>
    isSameDay(parseISO(ev.date), selectedDate)
  );

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-50 via-white to-green-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white/80 backdrop-blur-md border border-emerald-100 shadow-lg rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent drop-shadow-sm">
            Welcome, {student.name}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Department of <span className="font-medium">{student.department}</span> | {student.email}
          </p>
          {student.institution && (
            <p className="text-gray-500 text-sm mt-1 italic">
              {student.institution.name}, {student.institution.address}
            </p>
          )}
        </div>

        {student.profileImage && (
          <img
            src={student.profileImage}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-emerald-400 mt-4 sm:mt-0 shadow-lg hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={<FaCalendarAlt />} color="emerald" title="Total Events" value={totalEvents} />
        <StatCard icon={<FaCheckCircle />} color="green" title="Completed Events" value={completedEvents} />
        <StatCard icon={<FaClock />} color="teal" title="Total Hours" value={totalHours} />
        <StatCard icon={<FaAward />} color="yellow" title="Grace Marks" value={graceMarks} />
      </div>

      {/* Calendar + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Calendar */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-emerald-200/50 transition-all duration-300">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <FaCalendarAlt /> Upcoming Events
          </h2>
          <CustomStyledCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            upcomingEvents={upcomingEvents}
          />
        </div>

        {/* Events for selected date */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-emerald-200/50 transition-all duration-300">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <FaClock /> Events on {format(selectedDate, "MMMM dd, yyyy")}
          </h2>
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {eventsForSelectedDate.map((ev) => (
                <div
                  key={ev.id}
                  className="border border-emerald-100 rounded-xl p-4 hover:bg-emerald-50/60 transition-all duration-300 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{ev.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-emerald-600" />
                        {ev.location}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <FaUserTie className="text-emerald-600" />
                        {ev.teacher}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ev.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : ev.status === "Ongoing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No events on this date.</p>
          )}
        </div>
      </div>

      {/* All Events */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-emerald-100 p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
          <FaUserTie /> All Assigned Events
        </h2>
        {assignedEvents && assignedEvents.length > 0 ? (
          <div className="space-y-3">
            {assignedEvents.map((ev) => (
              <div
                key={ev.id}
                className="border border-gray-100 rounded-xl p-4 hover:bg-emerald-50/50 transition-all duration-300 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{ev.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt className="text-emerald-600" />
                      {ev.date ? ev.date.slice(0, 10) : "N/A"}
                      <span className="mx-2">|</span>
                      <FaMapMarkerAlt className="text-emerald-600" />
                      {ev.location}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaUserTie className="text-emerald-600" />
                      {ev.teacher}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ev.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : ev.status === "Ongoing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No assigned events yet.</p>
        )}
      </div>
    </div>
  );
};

// ✅ Custom-styled calendar with event indicators
const CustomStyledCalendar = ({ selectedDate, setSelectedDate, upcomingEvents }) => {
  return (
    <div className="[&_.react-calendar]:!border-none [&_.react-calendar]:!w-full [&_.react-calendar]:!bg-transparent">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date }) =>
          upcomingEvents.some((ev) => isSameDay(parseISO(ev.date), date)) ? (
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1"></div>
          ) : null
        }
        className="rounded-xl bg-white/80 p-4 shadow-inner border border-emerald-100 text-gray-700 [&_.react-calendar__tile]:rounded-lg [&_.react-calendar__tile--active]:!bg-emerald-600 [&_.react-calendar__tile--active]:!text-white [&_.react-calendar__tile--now]:!bg-emerald-100 hover:[&_.react-calendar__tile]:!bg-emerald-50 transition-all"
      />
    </div>
  );
};

// ✅ StatCard
const StatCard = ({ icon, color, title, value }) => {
  const colorClasses = {
    emerald: "from-emerald-500 to-green-600",
    green: "from-green-500 to-lime-600",
    teal: "from-teal-500 to-cyan-600",
    yellow: "from-yellow-400 to-amber-500",
  };

  return (
    <div
      className={`p-5 rounded-2xl shadow-lg bg-gradient-to-br ${colorClasses[color]} text-white flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="text-3xl drop-shadow-md">{icon}</div>
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;

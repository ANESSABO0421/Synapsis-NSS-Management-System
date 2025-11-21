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
        toast.error("Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  if (!dashboard) return <div className="text-center mt-10 text-red-500">No data available</div>;

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
    <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-white to-green-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 
        bg-white/80 backdrop-blur-md border border-emerald-100 shadow-lg 
        rounded-2xl p-5 sm:p-6 gap-4">
        
        <div className="w-full sm:w-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold 
            bg-gradient-to-r from-emerald-600 to-green-700 
            bg-clip-text text-transparent">
            Welcome, {student.name}
          </h1>

          <p className="text-gray-600 text-sm mt-1 break-all">
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
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-emerald-400 
            shadow-lg object-cover"
          />
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-10">
        <StatCard icon={<FaCalendarAlt />} color="emerald" title="Total Events" value={totalEvents} />
        <StatCard icon={<FaCheckCircle />} color="green" title="Completed" value={completedEvents} />
        <StatCard icon={<FaClock />} color="teal" title="Total Hours" value={totalHours} />
        <StatCard icon={<FaAward />} color="yellow" title="Grace Marks" value={graceMarks} />
      </div>

      {/* CALENDAR + EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* CALENDAR */}
        <div className="bg-white/90 rounded-2xl shadow-lg border border-emerald-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <FaCalendarAlt /> Upcoming Events
          </h2>

          <CustomStyledCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            upcomingEvents={upcomingEvents}
          />
        </div>

        {/* EVENTS FOR SELECTED DATE */}
        <div className="bg-white/90 rounded-2xl shadow-lg border border-emerald-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <FaClock /> Events on {format(selectedDate, "MMMM dd, yyyy")}
          </h2>

          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-300">
              {eventsForSelectedDate.map((ev) => (
                <EventItem key={ev.id} ev={ev} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No events on this date.</p>
          )}
        </div>
      </div>

      {/* ALL ASSIGNED EVENTS */}
      <div className="bg-white/90 rounded-2xl shadow-lg border border-emerald-100 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
          <FaUserTie /> All Assigned Events
        </h2>

        {assignedEvents.length > 0 ? (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-green-300">
            {assignedEvents.map((ev) => (
              <EventItem key={ev.id} ev={ev} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No assigned events yet.</p>
        )}
      </div>
    </div>
  );
};

const EventItem = ({ ev }) => (
  <div className="border border-emerald-100 rounded-xl p-4 hover:bg-emerald-50 transition shadow-sm">
    <div className="flex justify-between items-start gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{ev.title}</p>

        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
          <FaCalendarAlt className="text-emerald-600" />
          {ev.date?.slice(0, 10)}
        </p>

        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
          <FaMapMarkerAlt className="text-emerald-600" />
          {ev.location}
        </p>

        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
          <FaUserTie className="text-emerald-600" />
          {ev.teacher}
        </p>
      </div>

      <span
        className={`
          px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold
          ${
            ev.status === "Completed"
              ? "bg-emerald-100 text-emerald-700"
              : ev.status === "Ongoing"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }
        `}
      >
        {ev.status}
      </span>
    </div>
  </div>
);

const CustomStyledCalendar = ({ selectedDate, setSelectedDate, upcomingEvents }) => {
  return (
    <div className="[&_.react-calendar]:border-none [&_.react-calendar]:w-full">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        className="rounded-xl bg-white p-3 sm:p-4 shadow-inner text-gray-700"
        tileContent={({ date }) =>
          upcomingEvents.some((ev) => isSameDay(parseISO(ev.date), date)) ? (
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1"></div>
          ) : null
        }
      />
    </div>
  );
};

const StatCard = ({ icon, color, title, value }) => {
  const gradients = {
    emerald: "from-emerald-500 to-green-600",
    green: "from-green-500 to-lime-600",
    teal: "from-teal-500 to-cyan-600",
    yellow: "from-yellow-400 to-amber-500",
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl shadow-lg bg-gradient-to-br ${gradients[color]} 
      text-white flex items-center gap-4 hover:scale-[1.02] transition-transform`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs sm:text-sm opacity-90">{title}</p>
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;

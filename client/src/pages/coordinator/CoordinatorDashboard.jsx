import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaUserTie,
} from "react-icons/fa";

const CoordinatorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(
        "http://localhost:3000/api/coordinator/coordinatordashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-600 text-lg font-medium">
        Loading Coordinator Dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="text-center mt-20 text-red-500 text-lg font-medium">
        No dashboard data available.
      </div>
    );

  const {
    allEvents = {},
    myEvents = {},
    totalStudents = 0,
    totalVolunteers = 0,
    totalTeachers = 0,
    totalGraceRecommendations = 0,
  } = data;

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Coordinator Dashboard
      </h1>

      {/* ---------- ALL EVENTS SECTION ---------- */}
      <DashboardSection
        title="All NSS Events"
        color="text-green-700"
        stats={[
          {
            title: "Total Events",
            value: allEvents.totalEvents,
            icon: <FaCalendarAlt />,
          },
          {
            title: "Completed Events",
            value: allEvents.completedEvents,
            icon: <FaCheckCircle />,
          },
          {
            title: "Upcoming Events",
            value: allEvents.upcomingEvents,
            icon: <FaClock />,
          },
        ]}
        events={allEvents.recentEvents}
      />

      {/* ---------- MY MANAGED EVENTS SECTION ---------- */}
      <DashboardSection
        title="My Managed Events"
        color="text-green-700"
        stats={[
          {
            title: "My Total Events",
            value: myEvents.totalEvents,
            icon: <FaCalendarAlt />,
          },
          {
            title: "My Completed",
            value: myEvents.completedEvents,
            icon: <FaCheckCircle />,
          },
          {
            title: "My Upcoming",
            value: myEvents.upcomingEvents,
            icon: <FaClock />,
          },
        ]}
        events={myEvents.recentEvents}
      />

      {/* ---------- COMMUNITY OVERVIEW SECTION ---------- */}
      <section className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          Community Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={<FaUsers />}
          />
          <StatCard
            title="Total Volunteers"
            value={totalVolunteers}
            icon={<FaUsers />}
          />
          <StatCard
            title="Total Teachers"
            value={totalTeachers}
            icon={<FaUserTie />}
          />
          <StatCard
            title="Grace Marks Recommended"
            value={totalGraceRecommendations}
            icon={<FaCheckCircle />}
          />
        </div>
      </section>
    </div>
  );
};

/* ------------------------------ REUSABLE COMPONENTS ------------------------------ */

const DashboardSection = ({ title, color, stats, events }) => (
  <section className="bg-white shadow-md rounded-2xl p-6">
    <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${color}`}>
      <FaCalendarAlt /> {title}
    </h2>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>

    {/* Recent Events Table */}
    <RecentEventsTable title="Recent Events" events={events} />
  </section>
);

const StatCard = ({ title, value, icon }) => (
  <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition">
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">
        {value !== undefined ? value : 0}
      </h3>
    </div>
    <div className="text-green-500 text-2xl">{icon}</div>
  </div>
);

const RecentEventsTable = ({ title, events }) => (
  <div>
    <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-xl">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {!events || events.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                No events found
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    event.status === "Completed"
                      ? "text-green-600"
                      : event.status === "Upcoming"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {event.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default CoordinatorDashboard;

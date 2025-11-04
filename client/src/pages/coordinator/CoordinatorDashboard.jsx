import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaUserTie,
  FaRobot,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#34d399", "#facc15", "#f87171", "#60a5fa"];

const CoordinatorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [insight, setInsight] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ---------- FETCH DASHBOARD DATA ----------
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
      generateAutoInsight(res.data.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ---------- AUTO AI INSIGHT GENERATION ----------
  const generateAutoInsight = async (dashboardData) => {
    try {
      setAiLoading(true);
      const prompt = `
        Based on this NSS Coordinator data:
        - Total Students: ${dashboardData.totalStudents}
        - Total Volunteers: ${dashboardData.totalVolunteers}
        - Total Teachers: ${dashboardData.totalTeachers}
        - Grace Marks Recommended: ${dashboardData.totalGraceRecommendations}
        - Total Events: ${dashboardData.allEvents.totalEvents}
        - Completed Events: ${dashboardData.allEvents.completedEvents}
        - Upcoming Events: ${dashboardData.allEvents.upcomingEvents}
        - My Managed Events: ${dashboardData.myEvents.totalEvents}

        Provide 3-4 short insights about performance, engagement, and suggestions.
      `;

      const res = await axios.post("http://localhost:3000/api/ai/generate", {
        prompt,
      });

      setInsight(res.data.insight);
    } catch (err) {
      console.error(err);
      toast.error("Failed to auto-generate insights");
    } finally {
      setAiLoading(false);
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

  const eventData = [
    { name: "Completed", value: allEvents.completedEvents || 0 },
    { name: "Upcoming", value: allEvents.upcomingEvents || 0 },
    { name: "Total", value: allEvents.totalEvents || 0 },
  ];

  const barData = [
    {
      name: "Events",
      All: allEvents.totalEvents || 0,
      MyEvents: myEvents.totalEvents || 0,
    },
    {
      name: "Completed",
      All: allEvents.completedEvents || 0,
      MyEvents: myEvents.completedEvents || 0,
    },
    {
      name: "Upcoming",
      All: allEvents.upcomingEvents || 0,
      MyEvents: myEvents.upcomingEvents || 0,
    },
  ];

  const lineData = [
    { name: "Students", value: totalStudents },
    { name: "Volunteers", value: totalVolunteers },
    { name: "Teachers", value: totalTeachers },
  ];

  return (
    <div className="p-6 space-y-10 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
      <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">
        NSS Coordinator Dashboard
      </h1>

      {/* ---------- AI INSIGHT SECTION ---------- */}
      <motion.section
        className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-green-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <FaRobot className="text-green-600 text-3xl" />
          <h2 className="text-2xl font-semibold text-green-700">
            AI Insights
          </h2>
        </div>

        {aiLoading ? (
          <p className="text-gray-500 italic">Generating insights...</p>
        ) : insight ? (
          <motion.div
            className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-inner text-gray-800 whitespace-pre-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {insight}
          </motion.div>
        ) : (
          <p className="text-gray-500 italic">
            AI insights will appear here based on your dashboard statistics.
          </p>
        )}
      </motion.section>

      {/* ---------- OVERVIEW STATS ---------- */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <StatCard title="Total Students" value={totalStudents} icon={<FaUsers />} />
        <StatCard title="Total Volunteers" value={totalVolunteers} icon={<FaUsers />} />
        <StatCard title="Total Teachers" value={totalTeachers} icon={<FaUserTie />} />
        <StatCard
          title="Grace Marks Recommended"
          value={totalGraceRecommendations}
          icon={<FaCheckCircle />}
        />
      </motion.div>

      {/* ---------- CHARTS SECTION ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pie Chart */}
        <ChartCard title="Event Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {eventData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar Chart */}
        <ChartCard title="My vs All Events">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="All" fill="#34d399" />
              <Bar dataKey="MyEvents" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Line Chart */}
        <ChartCard title="Community Growth">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ---------- EVENTS SECTION ---------- */}
      <DashboardSection
        title="All NSS Events"
        color="text-green-700"
        stats={[
          { title: "Total Events", value: allEvents.totalEvents, icon: <FaCalendarAlt /> },
          { title: "Completed Events", value: allEvents.completedEvents, icon: <FaCheckCircle /> },
          { title: "Upcoming Events", value: allEvents.upcomingEvents, icon: <FaClock /> },
        ]}
        events={allEvents.recentEvents}
      />
    </div>
  );
};

/* ---------- REUSABLE COMPONENTS ---------- */
const StatCard = ({ title, value, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
  >
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-green-700">{value || 0}</h3>
    </div>
    <div className="text-green-500 text-3xl">{icon}</div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <motion.div
    className="bg-white rounded-2xl shadow-md p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h2 className="text-xl font-semibold mb-4 text-green-700">{title}</h2>
    {children}
  </motion.div>
);

const DashboardSection = ({ title, color, stats, events }) => (
  <motion.section
    className="bg-white shadow-md rounded-2xl p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${color}`}>
      <FaCalendarAlt /> {title}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>

    <RecentEventsTable title="Recent Events" events={events} />
  </motion.section>
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

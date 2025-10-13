import axios from "axios";
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaUserCog,
  FaUserGraduate,
  FaCalendarAlt,
  FaBookOpen,
} from "react-icons/fa";

const COLORS = ["#2563EB", "#16A34A", "#FACC15", "#F97316", "#8B5CF6"];

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const statFetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:3000/api/admin/dashboardata",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data.Data);
        console.log("fetched Data:", res.data.Data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    statFetch();
  }, [token]);

  // loading
  if (loading) {
    return (
      <div className="flex md:h-[500px] items-center justify-center">
        <CircularProgress color="success" />
      </div>
    );
  }

  const departmentData = (stats.student?.bydepartment || []).map((d) => ({
    department: d._id,
    count: d.count,
  }));
  console.log(departmentData);

  const eventData = [
    { name: "Completed", value: stats.event?.completed || 0 },
    { name: "Upcoming", value: stats.event?.upcoming || 0 },
  ];

  const cards = [
    {
      title: "Students",
      total: stats.student?.total || 0,
      icon: <FaUsers className="w-7 h-7 text-white opacity-90" />,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Teachers",
      total: stats.teacher?.total || 0,
      icon: <FaChalkboardTeacher className="w-7 h-7 text-white opacity-90" />,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Coordinators",
      total: stats.coordinator?.total || 0,
      icon: <FaUserCog className="w-7 h-7 text-white opacity-90" />,
      gradient: "from-cyan-500 to-teal-600",
    },
    {
      title: "Alumni",
      total: stats.alumni?.total || 0,
      icon: <FaUserGraduate className="w-7 h-7 text-white opacity-90" />,
      gradient: "from-orange-500 to-amber-600",
    },
    {
      title: "Events",
      total: stats.event?.total || 0,
      icon: <FaCalendarAlt className="w-7 h-7 text-white opacity-90" />,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="space-y-10 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-gray-800 tracking-tight"
      >
        Admin Dashboard
      </motion.h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl shadow-lg text-white bg-gradient-to-r ${card.gradient} flex items-center justify-between`}
          >
            <div>
              <p className="text-sm uppercase opacity-80">{card.title}</p>
              <h3 className="text-3xl font-bold">{card.total}</h3>
            </div>
            {card.icon}
          </motion.div>
        ))}
      </div>

      {/* Detailed Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Students */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaBookOpen className="text-blue-600" /> Students
          </h3>
          <p className="text-green-600 font-bold text-lg">
            Active: {stats.student?.active || 0}
          </p>
          <p className="text-yellow-500 font-bold text-lg">
            Pending: {stats.student?.pending || 0}
          </p>
          <p className="text-purple-600 font-bold text-lg">
            Volunteers: {stats.student?.volunteer || 0}
          </p>
        </motion.div>

        {/* Teachers */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaChalkboardTeacher className="text-green-600" /> Teachers
          </h3>
          <p className="text-green-600 font-bold text-lg">
            Active: {stats.teacher?.active || 0}
          </p>
          <p className="text-yellow-500 font-bold text-lg">
            Pending: {stats.teacher?.pending || 0}
          </p>
        </motion.div>

        {/* Coordinators */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaUserCog className="text-cyan-600" /> Coordinators
          </h3>
          <p className="text-green-600 font-bold text-lg">
            Active: {stats.coordinator?.active || 0}
          </p>
          <p className="text-yellow-500 font-bold text-lg">
            Pending: {stats.coordinator?.pending || 0}
          </p>
        </motion.div>

        {/* Alumni */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaUserGraduate className="text-orange-600" /> Alumni
          </h3>
          <p className="text-green-600 font-bold text-lg">
            Active: {stats.alumni?.active || 0}
          </p>
          <p className="text-yellow-500 font-bold text-lg">
            Pending: {stats.alumni?.pending || 0}
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Animated Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white p-6 rounded-xl shadow border border-gray-100"
        >
          <h3 className="font-semibold text-gray-700 mb-4">
            Students by Department
          </h3>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-10">
              No department data available
            </p>
          )}
        </motion.div>

        {/* Animated Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="bg-white p-6 rounded-xl shadow border border-gray-100"
        >
          <h3 className="font-semibold text-gray-700 mb-4">Event Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                animationDuration={1500}
              >
                {eventData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Calendar,
  GraduationCap,
  Star,
  Building,
  Clock,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";

const COLORS = ["#16a34a", "#f97316", "#8b5cf6", "#ef4444"];

const TeacherDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:3000/api/teacher/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setOverview(res.data.data);

          const recRes = await axios.get("http://localhost:3000/api/teacher/pending-recommendations", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (recRes.data.success) setPendingList(recRes.data.data);
        } else {
          toast.error(res.data.message || "Failed to load dashboard data.");
        }
      } catch (error) {
        console.error("Error fetching teacher overview:", error);
        toast.error(error.response?.data?.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        <Loader2 className="animate-spin mr-2" size={28} /> Loading Dashboard...
      </div>
    );

  if (!overview)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        <AlertCircle size={28} className="mr-2" /> No data available
      </div>
    );

  const {
    teacherName,
    institutionName,
    totalStudents,
    volunteers,
    totalEvents,
    completedEvents,
    upcomingEvents,
    institutionEvents,
    graceMarksGiven,
    graceMarkStats,
    recentEvents,
  } = overview;

  const eventData = [
    { name: "Completed", value: completedEvents || 0 },
    { name: "Upcoming", value: upcomingEvents || 0 },
    { name: "Others", value: totalEvents - completedEvents - upcomingEvents || 0 },
  ];

  const studentData = [
    { name: "Volunteers", value: volunteers || 0 },
    { name: "Others", value: totalStudents - volunteers || 0 },
  ];

  const graceData = [
    { name: "Approved", value: graceMarkStats?.approved || 0 },
    { name: "Pending", value: graceMarkStats?.pending || 0 },
    { name: "Rejected", value: graceMarkStats?.rejected || 0 },
  ];

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          Welcome back,
          <span className="text-green-700">{teacherName || "Teacher"}</span>
        </h1>
        <p className="text-gray-500 mt-1 text-sm flex items-center gap-1">
          <Building size={16} />{" "}
          <span className="font-medium text-gray-700">
            {institutionName || "N/A"}
          </span>
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6 mb-8">
        {/* My Events */}
        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-green-100 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Calendar size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">My Events</h3>
          </div>
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <p>Total: <span className="font-semibold">{totalEvents}</span></p>
            <p className="text-green-600">Completed: {completedEvents}</p>
            <p className="text-orange-500">Upcoming: {upcomingEvents}</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eventData} dataKey="value" nameKey="name" outerRadius={75} label>
                  {eventData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-blue-100 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <GraduationCap size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Students</h3>
          </div>
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <p>Total Students: <span className="font-semibold">{totalStudents}</span></p>
            <p className="text-green-600">Volunteers: {volunteers}</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={studentData} dataKey="value" nameKey="name" outerRadius={75} label>
                  {studentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grace Marks */}
        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-green-100 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Star size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Grace Marks</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Total Given: <span className="font-semibold">{graceMarksGiven}</span>
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="text-green-600" size={22} />
          <h3 className="font-semibold text-gray-800 text-lg">
            Pending Grace Recommendations
          </h3>
        </div>
        {pendingList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Marks</th>
                  <th className="p-3 text-left">Reason</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((rec, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">{rec.name}</td>
                    <td className="p-3">{rec.marks}</td>
                    <td className="p-3 text-gray-600">{rec.reason}</td>
                    <td className="p-3 text-gray-500">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-yellow-600 font-medium capitalize">
                      {rec.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No pending recommendations found.
          </p>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-green-600" size={22} />
          <h3 className="font-semibold text-gray-800 text-lg">Recent Events</h3>
        </div>
        {recentEvents?.length ? (
          <ul className="divide-y divide-gray-100">
            {recentEvents.map((event, i) => (
              <li key={i} className="py-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()} | {event.location || "N/A"}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    event.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : event.status === "Upcoming"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {event.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No recent events found.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

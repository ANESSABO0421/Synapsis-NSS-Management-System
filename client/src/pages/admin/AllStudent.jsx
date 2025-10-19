import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import CircularProgress from "@mui/material/CircularProgress";

const AllStudent = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch dashboard stat
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/admin/dashboardata", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.Data.student);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/students/getallstudent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAllStudents();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CircularProgress color="success" size={20} />
            <p className="text-sm font-medium text-gray-700">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* ======== STATS CARDS ======== */}
      <h2 className="mb-6 text-3xl font-bold text-gray-800">Student Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Total Students</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.total}</h3>
        </div>
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Active Students</p>
          <h3 className="text-3xl font-bold text-emerald-600">{stats.active}</h3>
        </div>
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Pending Students</p>
          <h3 className="text-3xl font-bold text-amber-500">{stats.pending}</h3>
        </div>
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Volunteers</p>
          <h3 className="text-3xl font-bold text-blue-500">{stats.volunteer}</h3>
        </div>
      </div>

      {/* ======== GROWTH CHART ======== */}
      <div className="bg-white border rounded-2xl shadow p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">7-Day Signup Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.growth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ======== ALL STUDENTS TABLE ======== */}
      <div className="bg-white border rounded-2xl shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            All Students <span className="text-green-600">({students.length})</span>
          </h3>
          <button
            onClick={fetchAllStudents}
            className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s, idx) => (
                  <tr
                    key={s._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium">{s.name}</td>
                    <td className="px-6 py-3">{s.email}</td>
                    <td className="px-6 py-3">{s.department || "—"}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : s.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 capitalize">{s.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllStudent;

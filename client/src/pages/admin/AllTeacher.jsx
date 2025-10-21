import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

const AllTeacher = () => {
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ===== Fetch Dashboard Teacher Stats =====
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3000/api/admin/dashboardata",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(res.data.Data.teacher);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Fetch All Teachers =====
  const fetchAllTeachers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/teacher/getallteacher",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  // ===== Approve Teacher =====
  const handleApprove = async (id, name) => {
    const confirmApprove = window.confirm(
      `Are you sure you want to approve ${name}?`
    );
    if (!confirmApprove) return;

    try {
      await axios.put(
        `http://localhost:3000/api/teacher/approvependingteacher/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ ${name} approved successfully`);
      fetchAllTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  // ===== Reject Teacher =====
  const handleReject = async (id, name) => {
    const confirmReject = window.confirm(
      `Are you sure you want to reject ${name}?`
    );
    if (!confirmReject) return;

    try {
      await axios.put(
        `http://localhost:3000/api/teacher/rejectteacherindashboard/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`❌ ${name} has been rejected`);
      fetchAllTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAllTeachers();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CircularProgress color="success" size={20} />
            <p className="text-sm font-medium text-gray-700">
              Loading teacher data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* ======== HEADER ======== */}
      <h2 className="mb-6 text-3xl font-bold text-gray-800">
        Teacher Dashboard
      </h2>

      {/* ======== STAT CARDS ======== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Total Teachers</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.total}</h3>
        </div>
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Active Teachers</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.active}</h3>
        </div>
        <div className="bg-white border rounded-2xl shadow p-5 text-center">
          <p className="text-gray-500 text-sm">Pending Teachers</p>
          <h3 className="text-3xl font-bold text-amber-500">{stats.pending}</h3>
        </div>
      </div>

      {/* ======== GROWTH CHART ======== */}
      <div className="bg-white border rounded-2xl shadow p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          7-Day Teacher Signup Growth
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.growth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#00A63E"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ======== TEACHER TABLE ======== */}
      <div className="bg-white border rounded-2xl shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            All Teachers{" "}
            <span className="text-green-600">({teachers.length})</span>
          </h3>
          <button
            onClick={fetchAllTeachers}
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
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((t, idx) => (
                  <tr
                    key={t._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium">{t.name}</td>
                    <td className="px-6 py-3">{t.email}</td>
                    <td className="px-6 py-3">{t.department || "—"}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === "active"
                            ? "bg-green-100 text-green-700"
                            : t.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {t.status === "active" ? (
                        <button
                          onClick={() => handleReject(t._id, t.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(t._id, t.name)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No teachers found
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

export default AllTeacher;

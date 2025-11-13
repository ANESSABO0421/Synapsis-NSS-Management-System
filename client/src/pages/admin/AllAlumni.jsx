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

const AllAlumni = () => {
  const [stats, setStats] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ===== Fetch Dashboard Data =====
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/alumni/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.alumnis || [];
      const active = data.filter((a) => a.status === "active").length;
      const pending = data.filter((a) => a.status === "pending").length;
      const rejected = data.filter((a) => a.status === "rejected").length;

      setStats({
        total: data.length,
        active,
        pending,
        rejected,
        growth: generateGrowthData(data),
      });
      setAlumni(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Generate Growth Data for Chart =====
  const generateGrowthData = (data) => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const count = data.filter(
        (a) => new Date(a.createdAt).toISOString().split("T")[0] === dateStr
      ).length;
      return { date: dateStr, count };
    });
  };

  // ===== Approve Alumni =====
  const handleApprove = async (id, name) => {
    const confirmApprove = window.confirm(
      `Are you sure you want to approve ${name}?`
    );
    if (!confirmApprove) return;

    try {
      await axios.put(
        `http://localhost:3000/api/alumni/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ ${name} approved successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  // ===== Reject Alumni =====
  const handleReject = async (id, name) => {
    const confirmReject = window.confirm(
      `Are you sure you want to reject ${name}?`
    );
    if (!confirmReject) return;

    try {
      await axios.put(
        `http://localhost:3000/api/alumni/reject-dashboard/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`❌ ${name} has been rejected`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CircularProgress color="success" size={20} />
            <p className="text-sm font-medium text-gray-700">
              Loading alumni data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* ===== HEADER ===== */}
      <h2 className="mb-6 text-3xl font-bold text-gray-800">
        Alumni Dashboard
      </h2>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Alumni" value={stats.total} color="green" />
        <StatCard title="Active Alumni" value={stats.active} color="emerald" />
        <StatCard title="Pending Alumni" value={stats.pending} color="amber" />
        <StatCard title="Rejected Alumni" value={stats.rejected} color="red" />
      </div>

      {/* ===== CHART ===== */}
      <div className="bg-white border rounded-2xl shadow p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          7-Day Alumni Signup Growth
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

      {/* ===== TABLE ===== */}
      <div className="bg-white border rounded-2xl shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            All Alumni{" "}
            <span className="text-green-600">({alumni.length})</span>
          </h3>
          <button
            onClick={fetchDashboardData}
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
                <th className="px-6 py-3">Institution</th>
                <th className="px-6 py-3">Graduation Year</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {alumni.length > 0 ? (
                alumni.map((a, idx) => (
                  <tr
                    key={a._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium">{a.name}</td>
                    <td className="px-6 py-3">{a.email}</td>
                    <td className="px-6 py-3">
                      {a.institution?.name || "—"}
                    </td>
                    <td className="px-6 py-3">{a.graduationYear || "—"}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.status === "active"
                            ? "bg-green-100 text-green-700"
                            : a.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {a.status === "active" ? (
                        <button
                          onClick={() => handleReject(a._id, a.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(a._id, a.name)}
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
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No alumni found
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

// ===== Helper Component for Stats =====
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-white border rounded-2xl shadow p-5 text-center border-${color}-200`}
  >
    <p className="text-gray-500 text-sm">{title}</p>
    <h3
      className={`text-3xl font-bold ${
        color === "red"
          ? "text-red-600"
          : color === "amber"
          ? "text-amber-500"
          : "text-green-600"
      }`}
    >
      {value}
    </h3>
  </div>
);

export default AllAlumni;

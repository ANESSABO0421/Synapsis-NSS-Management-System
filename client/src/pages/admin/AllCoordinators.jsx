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

const AllCoordinators = () => {
  const [stats, setStats] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3000/api/admin/dashboardata",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data.Data.coordinator);
    } catch (err) {
      toast.error("Failed to fetch coordinator stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/getallcoordinator",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoordinators(res.data.coordinator || []);
    } catch (err) {
      toast.error("Failed to load coordinators");
    }
  };

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to approve ${name}?`)) return;

    try {
      await axios.put(
        `http://localhost:3000/api/coordinator/approvecoordinator/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Approved ${name}`);
      fetchCoordinators();
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reject ${name}?`)) return;

    try {
      await axios.put(
        `http://localhost:3000/api/coordinator/rejectcoordinatorindahboard/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`Rejected ${name}`);
      fetchCoordinators();
    } catch (error) {
      toast.error("Rejection failed");
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchCoordinators();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-xl border bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CircularProgress color="success" size={20} />
            <p className="text-sm font-medium text-gray-700">
              Loading coordinator data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {/* HEADER */}
      <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800">
        Coordinator Dashboard
      </h2>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="bg-white border rounded-2xl shadow p-4 sm:p-5 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Total Coordinators</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-green-600">
            {stats.total}
          </h3>
        </div>

        <div className="bg-white border rounded-2xl shadow p-4 sm:p-5 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Active</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-green-600">
            {stats.active}
          </h3>
        </div>

        <div className="bg-white border rounded-2xl shadow p-4 sm:p-5 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">Pending</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-amber-500">
            {stats.pending}
          </h3>
        </div>
      </div>

      {/* SIGNUP GROWTH CHART */}
      <div className="bg-white border rounded-2xl shadow p-4 sm:p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          7-Day Coordinator Signup Growth
        </h3>

        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.growth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
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
      </div>

      {/* TABLE + MOBILE CARDS */}
      <div className="bg-white border rounded-2xl shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            All Coordinators{" "}
            <span className="text-green-600">({coordinators.length})</span>
          </h3>

          <button
            onClick={fetchCoordinators}
            className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            Refresh
          </button>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
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
              {coordinators.length > 0 ? (
                coordinators.map((c, idx) => (
                  <tr
                    key={c._id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3">{c.email}</td>
                    <td className="px-6 py-3">{c.department || "—"}</td>

                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === "active"
                            ? "bg-green-100 text-green-700"
                            : c.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-center">
                      {c.status === "active" ? (
                        <button
                          onClick={() => handleReject(c._id, c.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(c._id, c.name)}
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
                    No coordinators found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden p-4 space-y-4">
          {coordinators.map((c) => (
            <div
              key={c._id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <h4 className="font-bold text-gray-900 text-lg">{c.name}</h4>
              <p className="text-gray-700 text-sm">{c.email}</p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <b>Department:</b> {c.department || "—"}
                </p>

                <p>
                  <b>Status:</b>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === "active"
                        ? "bg-green-100 text-green-700"
                        : c.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </p>
              </div>

              {/* Mobile Actions */}
              <div className="mt-4 flex gap-2">
                {c.status === "active" ? (
                  <button
                    onClick={() => handleReject(c._id, c.name)}
                    className="w-full bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600"
                  >
                    Reject
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(c._id, c.name)}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCoordinators;

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

const AllStudent = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3000/api/admin/dashboardata",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data.Data.student);
    } catch (err) {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/students/getallstudent",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error("Failed to load students");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this student?"))
      return;
    try {
      await axios.put(
        `http://localhost:3000/api/students/approvependingstudent/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student approved successfully");
      fetchAllStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this student?"))
      return;
    try {
      await axios.put(
        `http://localhost:3000/api/students/rejectinallstudent/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student rejected successfully");
      fetchAllStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
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
            <p className="text-sm font-medium text-gray-700">
              Loading student data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {/* ======= Stats Cards ======= */}
      <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800">
        Student Dashboard
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          { label: "Total Students", value: stats.total, color: "text-green-600" },
          { label: "Active Students", value: stats.active, color: "text-emerald-600" },
          { label: "Pending Students", value: stats.pending, color: "text-amber-500" },
          { label: "Volunteers", value: stats.volunteer, color: "text-blue-500" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white border rounded-2xl shadow p-4 sm:p-5 text-center"
          >
            <p className="text-gray-500 text-xs sm:text-sm">{card.label}</p>
            <h3 className={`text-2xl sm:text-3xl font-bold ${card.color}`}>
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* ======= Growth Chart ======= */}
      <div className="bg-white border rounded-2xl shadow p-4 sm:p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          7-Day Signup Growth
        </h3>

        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.growth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#16a34a"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ======= Students Table/Card ======= */}
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

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, idx) => (
                <tr
                  key={s._id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
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
                          : s.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="px-6 py-3 capitalize">{s.role}</td>

                  <td className="px-6 py-3 text-center">
                    {s.status === "active" ? (
                      <button
                        onClick={() => handleReject(s._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                      >
                        Reject
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(s._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden p-4 space-y-4">
          {students.map((s) => (
            <div
              key={s._id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <h4 className="font-bold text-gray-900 text-lg">{s.name}</h4>
              <p className="text-gray-700 text-sm">{s.email}</p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <b>Department:</b> {s.department || "—"}
                </p>
                <p>
                  <b>Status:</b>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === "active"
                        ? "bg-green-100 text-green-700"
                        : s.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : s.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </p>
                <p>
                  <b>Role:</b> {s.role}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                {s.status === "active" ? (
                  <button
                    onClick={() => handleReject(s._id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Reject
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(s._id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
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

export default AllStudent;

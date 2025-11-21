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
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

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

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Approve ${name}?`)) return;

    try {
      await axios.put(
        `http://localhost:3000/api/alumni/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${name} approved successfully`);
      fetchDashboardData();
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}?`)) return;

    try {
      await axios.put(
        `http://localhost:3000/api/alumni/reject-dashboard/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`${name} rejected`);
      fetchDashboardData();
    } catch {
      toast.error("Rejection failed");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-xl border bg-white px-6 py-5 shadow-sm">
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
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {/* HEADER */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Alumni Dashboard
      </h2>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <StatCard title="Total Alumni" value={stats.total} color="green" />
        <StatCard title="Active Alumni" value={stats.active} color="emerald" />
        <StatCard title="Pending" value={stats.pending} color="amber" />
        <StatCard title="Rejected" value={stats.rejected} color="red" />
      </div>

      {/* GROWTH CHART */}
      <div className="bg-white border rounded-2xl shadow p-4 sm:p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          7-Day Alumni Signup Growth
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

      {/* ALUMNI TABLE (DESKTOP) */}
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

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Header title="Name" />
                <Header title="Email" />
                <Header title="Institution" />
                <Header title="Graduation Year" />
                <Header title="Status" />
                <Header title="Action" center />
              </tr>
            </thead>

            <tbody>
              {alumni.map((a, idx) => (
                <tr key={a._id} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                  <Cell>{a.name}</Cell>
                  <Cell>{a.email}</Cell>
                  <Cell>{a.institution?.name || "—"}</Cell>
                  <Cell>{a.graduationYear || "—"}</Cell>

                  <Cell>
                    <StatusBadge status={a.status} />
                  </Cell>

                  <td className="px-6 py-3 text-center">
                    {a.status === "active" ? (
                      <RejectBtn onClick={() => handleReject(a._id, a.name)} />
                    ) : (
                      <ApproveBtn
                        onClick={() => handleApprove(a._id, a.name)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden p-4 space-y-4">
          {alumni.map((a) => (
            <div key={a._id} className="border rounded-xl p-4 shadow-sm bg-white">
              <h4 className="font-bold text-gray-900 text-lg">{a.name}</h4>
              <p className="text-gray-700 text-sm">{a.email}</p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <b>Institution: </b> {a.institution?.name || "—"}
                </p>
                <p>
                  <b>Graduation Year: </b> {a.graduationYear || "—"}
                </p>

                <p>
                  <b>Status: </b> <StatusBadge status={a.status} />
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                {a.status === "active" ? (
                  <RejectMobile onClick={() => handleReject(a._id, a.name)} />
                ) : (
                  <ApproveMobile onClick={() => handleApprove(a._id, a.name)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- UI COMPONENTS ---------- */

const StatCard = ({ title, value, color }) => (
  <div className="bg-white border rounded-2xl shadow p-4 text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <h3
      className={`text-2xl sm:text-3xl font-bold ${
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

const Header = ({ title, center }) => (
  <th className={`px-6 py-3 ${center ? "text-center" : "text-left"}`}>
    {title}
  </th>
);

const Cell = ({ children }) => (
  <td className="px-6 py-3 text-gray-700">{children}</td>
);

const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === "active"
        ? "bg-green-100 text-green-700"
        : status === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {status}
  </span>
);

const ApproveBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
  >
    Approve
  </button>
);

const RejectBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
  >
    Reject
  </button>
);

const ApproveMobile = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
  >
    Approve
  </button>
);

const RejectMobile = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600"
  >
    Reject
  </button>
);

export default AllAlumni;

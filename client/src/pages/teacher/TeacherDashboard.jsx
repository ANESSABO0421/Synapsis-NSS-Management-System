import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TeacherDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch teacher overview + pending recommendations
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch teacher overview
        const res = await axios.get("http://localhost:3000/api/teacher/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setOverview(res.data.data);

          // Optional: Fetch pending recommendations list
          const recRes = await axios.get("http://localhost:3000/api/teacher/pending-recommendations", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (recRes.data.success) {
            setPendingList(recRes.data.data);
          }
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
        Loading Teacher Dashboard...
      </div>
    );

  if (!overview)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        No data available
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome,{" "}
          <span className="text-green-700">{teacherName || "Teacher"}</span>
        </h1>
        <p className="text-gray-600">
          Institution:{" "}
          <span className="font-medium">{institutionName || "N/A"}</span>
        </p>
      </div>

      {/* Top Overview Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* My Events */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition">
          <h3 className="font-semibold mb-2 text-gray-700">My Events</h3>
          <p>Total: <span className="font-semibold">{totalEvents}</span></p>
          <p className="text-green-600">Completed: {completedEvents}</p>
          <p className="text-orange-500">Upcoming: {upcomingEvents}</p>
        </div>

        {/* Students */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 hover:shadow-md transition">
          <h3 className="font-semibold mb-2 text-gray-700">Students</h3>
          <p>Total Students: <span className="font-semibold">{totalStudents}</span></p>
          <p className="text-blue-600">Volunteers: {volunteers}</p>
        </div>

        {/* Grace Marks Given */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-200 hover:shadow-md transition">
          <h3 className="font-semibold mb-2 text-gray-700">Grace Marks Given</h3>
          <p>Total: <span className="font-semibold">{graceMarksGiven}</span></p>
        </div>
      </div>

      {/* Institution + Grace Recommendations */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Institution Events */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-200 hover:shadow-md transition">
          <h3 className="font-semibold mb-2 text-gray-700">Institution Events</h3>
          <p>Total: <span className="font-semibold">{institutionEvents}</span></p>
        </div>

        {/* Grace Mark Recommendations */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-yellow-200 hover:shadow-md transition">
          <h3 className="font-semibold mb-3 text-gray-700">
            Grace Mark Recommendations
          </h3>
          <p>Total: <span className="font-semibold">{graceMarkStats?.total || 0}</span></p>
          <p className="text-yellow-600">Pending: {graceMarkStats?.pending || 0}</p>
          <p className="text-green-600">Approved: {graceMarkStats?.approved || 0}</p>
          <p className="text-red-600">Rejected: {graceMarkStats?.rejected || 0}</p>
        </div>
      </div>

      {/* Pending Grace Recommendations */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Pending Grace Recommendations</h3>
        {pendingList.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-3">Student Name</th>
                <th className="p-3">Marks</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((rec, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3">{rec.name}</td>
                  <td className="p-3">{rec.marks}</td>
                  <td className="p-3">{rec.reason}</td>
                  <td className="p-3">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className="p-3 text-yellow-600 font-medium capitalize">
                    {rec.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No pending recommendations found.</p>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-semibold mb-3 text-gray-700">Recent Events</h3>
        {recentEvents?.length ? (
          <ul className="divide-y divide-gray-100">
            {recentEvents.map((event, i) => (
              <li key={i} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()} |{" "}
                      {event.location || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      event.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : event.status === "Upcoming"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No recent events found.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

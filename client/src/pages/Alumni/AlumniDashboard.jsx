import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaComments,
  FaUserGraduate,
  FaCalendarAlt,
} from "react-icons/fa";
import { Star } from "lucide-react";

const AlumniDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboard();
    fetchFeedbacks();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alumni/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(res.data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/mentorship/mentee-feedback/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      console.error("Feedback fetch error:", err);
    }
  };

  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={`${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));

  if (loading || !dashboard)
    return <p className="text-center mt-10 text-lg text-gray-600">Loading...</p>;

  const latestFeedback = feedbacks[feedbacks.length - 1];

  return (
    <div className="space-y-10 p-4 sm:p-6 bg-gradient-to-b from-green-50 to-white min-h-screen">

      {/* =======================================================
          PROFILE HEADER
      ======================================================== */}
      <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-6 border border-green-100">
        <img
          src={dashboard.profileImage?.url || "/default-user.png"}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg ring-4 ring-green-500/50 mx-auto sm:mx-0"
        />

        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{dashboard.name}</h2>
          <p className="text-gray-600 break-all">{dashboard.email}</p>
          <p className="text-gray-700">
            {dashboard.department} • {dashboard.graduationYear}
          </p>
          <p className="text-gray-700 mt-1">
            Institution:{" "}
            <span className="font-semibold text-green-800">
              {dashboard.institution?.name}
            </span>
          </p>
        </div>
      </div>

      {/* =======================================================
          STATS GRID
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Mentorship Count */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl flex items-center gap-4 hover:scale-[1.02] transition">
          <FaUserGraduate className="text-4xl opacity-90" />
          <div>
            <p className="text-3xl sm:text-4xl font-bold">{dashboard.mentorships.length}</p>
            <p className="opacity-90">Total Mentorships</p>
          </div>
        </div>

        {/* Feedback Count */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-xl flex items-center gap-4 hover:scale-[1.02] transition">
          <FaComments className="text-4xl opacity-90" />
          <div>
            <p className="text-3xl sm:text-4xl font-bold">{feedbacks.length}</p>
            <p className="opacity-90">Feedback Received</p>
          </div>
        </div>

        {/* Testimonials Count */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl flex items-center gap-4 hover:scale-[1.02] transition">
          <FaComments className="text-4xl opacity-90" />
          <div>
            <p className="text-3xl sm:text-4xl font-bold">{dashboard.testimonials.length}</p>
            <p className="opacity-90">Testimonials</p>
          </div>
        </div>
      </div>

      {/* =======================================================
          ⭐ LATEST FEEDBACK
      ======================================================== */}
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 border border-green-100">

        <h3 className="text-xl sm:text-2xl font-bold text-green-800 flex items-center gap-2 mb-4">
          ⭐ Latest Student Feedback
        </h3>

        {!latestFeedback ? (
          <p className="text-gray-500 italic">No feedback received yet.</p>
        ) : (
          <div className="p-4 sm:p-6 rounded-xl border bg-gray-50 shadow-inner">

            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FaUserGraduate className="text-green-700 text-xl" />
              </div>

              <div>
                <p className="font-semibold text-green-700">{latestFeedback.mentee?.name}</p>
                <p className="text-gray-500 text-sm break-all">
                  {latestFeedback.mentee?.email}
                </p>
              </div>
            </div>

            <div className="flex gap-1 mb-3">{renderStars(latestFeedback.feedback.rating)}</div>

            <p className="p-3 bg-white rounded-lg border text-gray-700 shadow-sm">
              {latestFeedback.feedback.comment}
            </p>

            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <FaCalendarAlt /> Completed:{" "}
              {latestFeedback.completedAt
                ? new Date(latestFeedback.completedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        )}
      </div>

      {/* =======================================================
          MENTORSHIP LIST
      ======================================================== */}
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 border border-green-100">
        <h3 className="text-xl sm:text-2xl font-bold text-green-800 flex items-center gap-2 mb-4">
          📘 Mentorship Sessions
        </h3>

        {dashboard.mentorships.length === 0 ? (
          <p className="text-gray-500">No mentorship sessions found.</p>
        ) : (
          <div className="space-y-3">
            {dashboard.mentorships.map((m) => (
              <div
                key={m._id}
                className="p-4 bg-gray-50 rounded-xl border hover:bg-gray-100 transition"
              >
                <p className="font-semibold text-gray-800 break-words">
                  Topic: {m.topic}
                </p>
                <p className="text-gray-600 text-sm">Status: {m.status}</p>
                <p className="text-gray-500 text-xs">
                  Requested: {new Date(m.requestDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =======================================================
          🟦 TESTIMONIALS SECTION
      ======================================================== */}
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 border border-green-100">
        <h3 className="text-xl sm:text-2xl font-bold text-green-700 flex items-center gap-2 mb-4">
          💬 Testimonials
        </h3>

        {dashboard.testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dashboard.testimonials.map((t) => (
              <div
                key={t._id}
                className="p-4 sm:p-5 bg-green-50 border border-green-100 rounded-xl shadow hover:shadow-lg transition"
              >
                <p className="text-gray-800 font-medium mb-2 break-words">
                  “{t.message}”
                </p>

                <p className="text-xs text-gray-500 mb-1">
                  Visibility:{" "}
                  <span className="font-semibold text-green-600">
                    {t.visibility}
                  </span>
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AlumniDashboard;

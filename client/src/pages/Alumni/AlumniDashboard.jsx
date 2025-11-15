import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaAward,
  FaComments,
  FaUserGraduate,
  FaCalendarAlt,
} from "react-icons/fa";

const AlumniDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboard();
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!dashboard) return <p className="text-center mt-10">No data found.</p>;

  return (
    <div className="space-y-6">

      {/* 🔹 Profile Card */}
      <div className="bg-white shadow rounded-xl p-6 flex items-center gap-6 border">
        <img
          src={dashboard.profileImage?.url || "/default-user.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover ring-2 ring-green-500"
        />

        <div>
          <h2 className="text-2xl font-semibold">{dashboard.name}</h2>
          <p className="text-gray-600">{dashboard.email}</p>
          <p className="text-gray-600">
            {dashboard.department} • {dashboard.graduationYear}
          </p>
          <p className="text-gray-600">
            Institution:{" "}
            <span className="font-medium">{dashboard.institution?.name}</span>
          </p>
        </div>
      </div>

      {/* 🔹 Stats Section (Counts only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Mentorship Count */}
        <div className="p-5 bg-green-600 text-white rounded-xl shadow-lg flex items-center gap-4">
          <FaUserGraduate className="text-4xl" />
          <div>
            <p className="text-3xl font-bold">{dashboard.mentorships.length}</p>
            <p className="text-sm">Total Mentorships</p>
          </div>
        </div>

        {/* Achievements Count */}
        <div className="p-5 bg-yellow-500 text-white rounded-xl shadow-lg flex items-center gap-4">
          <FaAward className="text-4xl" />
          <div>
            <p className="text-3xl font-bold">{dashboard.achievements.length}</p>
            <p className="text-sm">Achievements</p>
          </div>
        </div>

        {/* Testimonials Count */}
        <div className="p-5 bg-blue-600 text-white rounded-xl shadow-lg flex items-center gap-4">
          <FaComments className="text-4xl" />
          <div>
            <p className="text-3xl font-bold">{dashboard.testimonials.length}</p>
            <p className="text-sm">Testimonials</p>
          </div>
        </div>
      </div>

      {/* 🔹 Achievements List */}
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaAward /> Achievements
        </h3>

        {dashboard.achievements.length === 0 ? (
          <p className="text-gray-500">No achievements yet.</p>
        ) : (
          <ul className="space-y-3">
            {dashboard.achievements.map((a) => (
              <li
                key={a._id}
                className="p-4 bg-gray-100 rounded-lg border hover:bg-gray-200 transition"
              >
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-600">{a.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(a.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔹 Testimonials List */}
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaComments /> Testimonials
        </h3>

        {dashboard.testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials yet.</p>
        ) : (
          <ul className="space-y-3">
            {dashboard.testimonials.map((t) => (
              <li
                key={t._id}
                className="p-4 bg-gray-100 rounded-lg border hover:bg-gray-200 transition"
              >
                <p className="font-medium">"{t.message}"</p>
                <p className="text-xs text-gray-600 capitalize">
                  Status: {t.visibility}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔹 Mentorships */}
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaUserGraduate /> Mentorship Sessions
        </h3>

        {dashboard.mentorships.length === 0 ? (
          <p className="text-gray-500">No mentorships yet.</p>
        ) : (
          <ul className="space-y-3">
            {dashboard.mentorships.map((m) => (
              <li
                key={m._id}
                className="p-4 bg-gray-100 rounded-lg border hover:bg-gray-200 transition"
              >
                <p className="font-medium">Topic: {m.topic}</p>
                <p className="text-sm text-gray-600">Status: {m.status}</p>
                <p className="text-xs text-gray-500">
                  Requested: {new Date(m.requestDate).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default AlumniDashboard;

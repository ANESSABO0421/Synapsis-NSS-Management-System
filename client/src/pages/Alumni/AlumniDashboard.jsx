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
      const res = await axios.get(
        "http://localhost:3000/api/alumni/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    //   console.log(res.data.dashboard)
      setDashboard(res.data.dashboard);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!dashboard) return <p className="text-center mt-10">No data found.</p>;

  const { profile, mentorshipStats, achievements, testimonials, joinedAt } =
    dashboard;

    console.log(dashboard.profile.profileImage)

  return (
    <div className="space-y-6">
      {/* 🔹 Profile Card */}
      <div className="bg-white shadow rounded-xl p-6 flex items-center gap-6 border">
        <img
          src={dashboard.profile.profileImage|| "/default-user.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover ring-2 ring-green-500"
        />
        <div>
          <h2 className="text-2xl font-semibold">{profile.name}</h2>
          <p className="text-gray-600">{profile.email}</p>
          <p className="text-gray-600">
            {profile.department} • {profile.graduationYear}
          </p>
          <p className="text-gray-600">
            Institution:{" "}
            <span className="font-medium">{profile.institution?.name}</span>
          </p>
        </div>
      </div>

      {/* 🔹 Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mentorship Stats */}
        <div className="p-5 bg-green-600 text-white rounded-xl shadow-lg flex items-center gap-4">
          <FaUserGraduate className="text-4xl" />
          <div>
            <p className="text-3xl font-bold">
              {mentorshipStats.totalSessions || 0}
            </p>
            <p className="text-sm">Mentorship Sessions</p>
          </div>
        </div>

        {/* Achievements Count */}
        <div className="p-5 bg-yellow-500 text-white rounded-xl shadow-lg flex items-center gap-4">
          <FaAward className="text-4xl" />
          <div>
            <p className="text-3xl font-bold">{achievements.total}</p>
            <p className="text-sm">Achievements</p>
          </div>
        </div>

        {/* Testimonials Count */}
        <div className="p-5 bg-blue-600 text-white rounded-xl shadow-lg flex items-center gap-4">
          <FaComments className="text-4xl" />
          <div>
            <p className="text-3xl font-bold">{testimonials.total}</p>
            <p className="text-sm">Testimonials</p>
          </div>
        </div>
      </div>

      {/* 🔹 Recent Achievements */}
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaAward /> Recent Achievements
        </h3>

        {achievements.recent.length === 0 ? (
          <p className="text-gray-500">No achievements yet.</p>
        ) : (
          <ul className="space-y-3">
            {achievements.recent.map((a) => (
              <li
                key={a._id}
                className="p-4 bg-gray-100 rounded-lg border hover:bg-gray-200 transition"
              >
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-600">{a.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔹 Recent Testimonials */}
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaComments /> Recent Testimonials
        </h3>

        {testimonials.recent.length === 0 ? (
          <p className="text-gray-500">No testimonials yet.</p>
        ) : (
          <ul className="space-y-3">
            {testimonials.recent.map((t) => (
              <li
                key={t._id}
                className="p-4 bg-gray-100 rounded-lg border hover:bg-gray-200 transition"
              >
                <p className="font-medium">"{t.message}"</p>
                <p className="text-sm text-gray-600">- {t.fromStudent}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Joined At */}
      <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-2 mt-6">
        <FaCalendarAlt /> Joined on: {new Date(joinedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default AlumniDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ManageMentorshipAlumni = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/mentorship/mentor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mentorship requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (mentorshipId, status) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${mentorshipId}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  const startSession = async (mentorshipId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${mentorshipId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Session started!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session");
    }
  };

  const endSession = async (mentorshipId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${mentorshipId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Session ended!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to end session");
    }
  };

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const completed = requests.filter((r) => r.status === "completed").length;

  return (
    <div className="w-full p-8 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">

      {/* ---------- PAGE HEADER ---------- */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-10 tracking-tight">
        Manage Mentorship Requests
      </h1>

      {/* ---------- STATS SECTION ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        <div className="rounded-2xl p-6 shadow-xl bg-white/80 backdrop-blur-xl border border-white/30 hover:scale-[1.02] transition-all duration-300">
          <p className="text-gray-500 text-sm">Total Requests</p>
          <h2 className="text-5xl font-extrabold text-emerald-600 mt-2">{total}</h2>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white/80 backdrop-blur-xl border border-yellow-100 hover:scale-[1.02] transition-all duration-300">
          <p className="text-gray-600 text-sm">Pending Requests</p>
          <h2 className="text-5xl font-extrabold text-yellow-500 mt-2">{pending}</h2>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white/80 backdrop-blur-xl border border-green-100 hover:scale-[1.02] transition-all duration-300">
          <p className="text-gray-600 text-sm">Completed Sessions</p>
          <h2 className="text-5xl font-extrabold text-green-600 mt-2">{completed}</h2>
        </div>
      </div>

      {/* ---------- REQUEST CARDS ---------- */}
      <div className="space-y-8">
        {requests.map((req) => (
          <div
            key={req._id}
            className="rounded-2xl p-7 bg-white shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Title + Status */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                {req.topic}
              </h2>

              <span
                className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize shadow-sm
                  ${
                    req.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : req.status === "active"
                      ? "bg-blue-100 text-blue-700"
                      : req.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
              >
                {req.status}
              </span>
            </div>

            {/* Student Info */}
            <div className="space-y-1 text-gray-700">
              <p><span className="font-semibold">Student:</span> {req.mentee?.name}</p>
              <p><span className="font-semibold">Email:</span> {req.mentee?.email}</p>
            </div>

            {/* Description */}
            {req.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">
                {req.description}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-6">

              {req.status === "pending" && (
                <>
                  <button
                    onClick={() => respond(req._id, "active")}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => respond(req._id, "rejected")}
                    className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition"
                  >
                    Reject
                  </button>
                </>
              )}

              {req.status === "active" && (
                <>
                  <button
                    onClick={() => navigate(`/mentorship/chat/${req._id}`)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                  >
                    Open Chat
                  </button>

                  <button
                    onClick={() => navigate(`/mentorship/${req._id}/meeting-link`)}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition"
                  >
                    Meeting Link
                  </button>

                  <button
                    onClick={() => startSession(req._id)}
                    className="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md transition"
                  >
                    Start Session
                  </button>

                  <button
                    onClick={() => endSession(req._id)}
                    className="px-6 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-semibold shadow-md transition"
                  >
                    End Session
                  </button>
                </>
              )}

              {req.status === "completed" && (
                <div className="px-4 py-2 bg-green-100 border-l-4 border-green-600 text-green-700 rounded">
                  Session Completed ✔
                </div>
              )}

              {req.status === "rejected" && (
                <p className="text-red-600 font-semibold">Rejected</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageMentorshipAlumni;

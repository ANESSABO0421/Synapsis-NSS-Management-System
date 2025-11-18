import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ManageMentorshipAlumni = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [currentId, setCurrentId] = useState(null);

  const token = localStorage.getItem("token");

  // --------------------------------------
  // 🚀 Fetch all mentorship requests
  // --------------------------------------
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/mentorship/mentor",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(res.data.requests || []);
    } catch (err) {
      toast.error("Failed to load mentorship requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --------------------------------------
  // 🚀 Accept / Reject
  // --------------------------------------
  const respond = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${id}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update request");
    }
  };

  // --------------------------------------
  // 🚀 Start / End Session
  // --------------------------------------
  const startSession = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${id}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Session started");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to start session");
    }
  };

  const endSession = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${id}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Session ended");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to end session");
    }
  };

  // --------------------------------------
  // 🚀 Open Meeting Link Modal
  // --------------------------------------
  const openModal = (id, existingLink) => {
    setCurrentId(id);
    setMeetingLink(existingLink || ""); // prefill if exists
    setShowModal(true);
  };

  // --------------------------------------
  // 🚀 Save Meeting Link
  // --------------------------------------
  const saveMeetingLink = async () => {
    if (!meetingLink.trim()) {
      toast.error("Please enter a valid Google Meet link");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${currentId}/meeting-link`,
        { link: meetingLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Meeting link updated");
      setShowModal(false);
      setMeetingLink("");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update meeting link");
    }
  };

  // --------------------------------------
  // 📊 Stats
  // --------------------------------------
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const completed = requests.filter((r) => r.status === "completed").length;

  return (
    <div className="w-full p-10 bg-gradient-to-b from-emerald-50 to-white min-h-screen">

      {/* PAGE HEADER */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-10 tracking-tight">
        Manage Mentorship Requests
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
        <div className="rounded-2xl p-6 shadow-xl bg-white/90 hover:scale-[1.02] transition">
          <p className="text-gray-500 text-sm">Total Requests</p>
          <h2 className="text-5xl font-extrabold text-emerald-600 mt-2">{total}</h2>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white/90 border-yellow-200 hover:scale-[1.02] transition">
          <p className="text-gray-600 text-sm">Pending Requests</p>
          <h2 className="text-5xl font-extrabold text-yellow-500 mt-2">{pending}</h2>
        </div>

        <div className="rounded-2xl p-6 shadow-xl bg-white/90 border-green-200 hover:scale-[1.02] transition">
          <p className="text-gray-600 text-sm">Completed Sessions</p>
          <h2 className="text-5xl font-extrabold text-green-600 mt-2">{completed}</h2>
        </div>
      </div>

      {/* REQUEST LIST */}
      <div className="space-y-8">
        {requests.map((req) => (
          <div
            key={req._id}
            className="rounded-2xl p-7 bg-white shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition"
          >
            {/* TITLE & STATUS */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{req.topic}</h2>

              <span
                className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize
                ${
                  req.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : req.status === "active"
                    ? "bg-blue-100 text-blue-700"
                    : req.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {req.status}
              </span>
            </div>

            {/* STUDENT INFO */}
            <div className="text-gray-700">
              <p><span className="font-semibold">Student:</span> {req.mentee?.name}</p>
              <p><span className="font-semibold">Email:</span> {req.mentee?.email}</p>
            </div>

            {/* DESCRIPTION */}
            {req.description && (
              <p className="mt-4 text-gray-600">{req.description}</p>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-6">

              {/* Pending */}
              {req.status === "pending" && (
                <>
                  <button
                    onClick={() => respond(req._id, "active")}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => respond(req._id, "rejected")}
                    className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600"
                  >
                    Reject
                  </button>
                </>
              )}

              {/* Active */}
              {req.status === "active" && (
                <>
                  {/* Meeting Link Button */}
                  <button
                    onClick={() => openModal(req._id, req.meetingLink)}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Meeting Link
                  </button>

                  <button
                    onClick={() => startSession(req._id)}
                    className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Start Session
                  </button>

                  <button
                    onClick={() => endSession(req._id)}
                    className="px-6 py-2.5 rounded-xl bg-gray-700 text-white hover:bg-gray-800"
                  >
                    End Session
                  </button>
                </>
              )}

              {/* Completed */}
              {req.status === "completed" && (
                <p className="px-4 py-2 bg-green-100 text-green-700 rounded">
                  Session Completed ✔
                </p>
              )}

              {/* Rejected */}
              {req.status === "rejected" && (
                <p className="text-red-600 font-semibold">Rejected</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --------------------------------------
          MODAL — ADD/UPDATE MEETING LINK
      -------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[420px] animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add / Update Meeting Link
            </h2>

            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Paste Google Meet link"
              className="w-full border p-3 rounded-lg mb-4 focus:ring focus:ring-emerald-300"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={saveMeetingLink}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageMentorshipAlumni;

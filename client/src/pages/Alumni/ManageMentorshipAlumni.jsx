import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ManageMentorshipAlumni = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [currentId, setCurrentId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/mentorship/mentor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      toast.error("Failed to load mentorship requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const openModal = (id, link) => {
    setCurrentId(id);
    setMeetingLink(link || "");
    setShowModal(true);
  };

  const saveMeetingLink = async () => {
    if (!meetingLink.trim()) return toast.error("Please enter a valid link");

    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${currentId}/meeting-link`,
        { link: meetingLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Meeting link saved!");
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update meeting link");
    }
  };

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const completed = requests.filter((r) => r.status === "completed").length;

  return (
    <div className="w-full p-10 min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">

      {/* HEADER */}
      <h1 className="text-5xl font-extrabold text-gray-800 mb-12 tracking-tight drop-shadow-sm">
        Manage Mentorships
      </h1>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

        <div className="p-6 rounded-3xl shadow-xl bg-white/70 backdrop-blur-lg border border-white/40 hover:shadow-2xl hover:-translate-y-1 transition-all">
          <p className="text-gray-500 text-sm">Total Requests</p>
          <h2 className="text-6xl font-black text-emerald-600 mt-2">{total}</h2>
        </div>

        <div className="p-6 rounded-3xl shadow-xl bg-yellow-50 border border-yellow-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
          <p className="text-gray-700 text-sm">Pending</p>
          <h2 className="text-6xl font-black text-yellow-500 mt-2">{pending}</h2>
        </div>

        <div className="p-6 rounded-3xl shadow-xl bg-green-50 border border-green-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
          <p className="text-gray-700 text-sm">Completed</p>
          <h2 className="text-6xl font-black text-green-600 mt-2">{completed}</h2>
        </div>

      </div>

      {/* REQUEST LIST */}
      <div className="space-y-10">
        {requests.map((req) => (
          <div
            key={req._id}
            className="p-8 rounded-3xl bg-white/80 backdrop-blur-lg shadow-xl border border-white/40 hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">{req.topic}</h2>

              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full capitalize shadow-sm
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

            {/* STUDENT INFO */}
            <div className="text-gray-700 text-lg leading-relaxed">
              <p><span className="font-semibold">Student:</span> {req.mentee?.name}</p>
              <p><span className="font-semibold">Email:</span> {req.mentee?.email}</p>
            </div>

            {/* DESCRIPTION */}
            {req.description && (
              <p className="mt-4 text-gray-600 bg-gray-50 p-4 rounded-xl border">
                {req.description}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8">

              {req.status === "pending" && (
                <>
                  <button
                    onClick={() => respond(req._id, "active")}
                    className="px-8 py-3 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => respond(req._id, "rejected")}
                    className="px-8 py-3 rounded-xl bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </>
              )}

              {req.status === "active" && (
                <>
                  <button
                    onClick={() => openModal(req._id, req.meetingLink)}
                    className="px-8 py-3 rounded-xl bg-purple-600 text-white shadow-md hover:bg-purple-700 transition"
                  >
                    Meeting Link
                  </button>

                  <button
                    onClick={() => startSession(req._id)}
                    className="px-8 py-3 rounded-xl bg-yellow-500 text-white shadow-md hover:bg-yellow-600 transition"
                  >
                    Start
                  </button>

                  <button
                    onClick={() => endSession(req._id)}
                    className="px-8 py-3 rounded-xl bg-gray-700 text-white shadow-md hover:bg-gray-800 transition"
                  >
                    End
                  </button>
                </>
              )}

              {req.status === "completed" && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl">
                  ✔ Session Completed
                </span>
              )}

              {req.status === "rejected" && (
                <span className="px-4 py-2 text-red-600 font-semibold">
                  Rejected ❌
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-[420px] border border-white/40 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Meeting Link</h2>

            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full border p-3 rounded-xl shadow-inner focus:ring-2 focus:ring-emerald-500"
              placeholder="Paste Google Meet URL"
            />

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveMeetingLink}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
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

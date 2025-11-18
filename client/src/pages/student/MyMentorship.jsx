import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MyMentorships = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  const token = localStorage.getItem("token");

  // FETCH SESSIONS
  const fetchMySessions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/mentorship/student",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSessions(res.data.sessions || []);
    } catch (err) {
      toast.error("Failed to load mentorships");
    }
  };

  useEffect(() => {
    fetchMySessions();
  }, []);

  // SUBMIT FEEDBACK
  const submitFeedback = async () => {
    if (!feedbackRating) return toast.error("Please select a rating");

    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${selectedSession._id}/feedback`,
        { rating: feedbackRating, comment: feedbackComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Feedback submitted successfully!");
      setShowFeedbackModal(false);
      fetchMySessions();
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  // STATUS COLOR
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen w-full p-10 bg-gradient-to-b from-blue-50 via-white to-emerald-50">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-10 tracking-tight">
        My Mentorships
      </h1>

      {/* ==== Sessions ==== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sessions.map((session) => (
          <motion.div
            key={session._id}
            whileHover={{ scale: 1.015 }}
            className="cursor-pointer rounded-2xl p-6 bg-white/70 backdrop-blur-xl shadow-xl border border-white/40 hover:shadow-2xl transition-all"
            onClick={() => setSelectedSession(session)}
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900">
                {session.topic}
              </h2>

              <span
                className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize shadow-sm ${
                  statusClasses[session.status]
                }`}
              >
                {session.status}
              </span>
            </div>

            {/* MENTOR */}
            <p className="mt-3 text-gray-700">
              <span className="font-semibold">Mentor:</span>{" "}
              {session.mentor?.name}
            </p>

            {/* DESCRIPTION */}
            {session.description && (
              <p className="mt-3 text-gray-600 leading-relaxed line-clamp-2">
                {session.description}
              </p>
            )}

            {/* MEETING BUTTON */}
            {session.meetingLink && session.status !== "pending" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSession(session);
                  setShowMeetingModal(true);
                }}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                View Meeting Link
              </button>
            )}

            {/* FEEDBACK BUTTON */}
            {session.status === "completed" &&
              !session.menteeFeedback?.rating && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSession(session);
                    setShowFeedbackModal(true);
                  }}
                  className="mt-4 ml-3 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700"
                >
                  Give Feedback ⭐
                </button>
              )}
          </motion.div>
        ))}
      </div>

      {/* ================================================================
         MODAL — MEETING LINK
      ================================================================ */}
      <AnimatePresence>
        {showMeetingModal && selectedSession && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Meeting Link
              </h2>

              <a
                href={selectedSession.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-semibold break-all"
              >
                {selectedSession.meetingLink}
              </a>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
         MODAL — FEEDBACK FORM
      ================================================================ */}
      <AnimatePresence>
        {showFeedbackModal && selectedSession && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4">Give Feedback</h2>

              {/* Rating */}
              <p className="font-semibold mb-1">Rating:</p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFeedbackRating(n)}
                    className={`px-3 py-1 rounded-lg border ${
                      feedbackRating === n
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {n} ⭐
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                className="w-full border rounded-lg p-3"
                rows="3"
                placeholder="Your feedback..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={submitFeedback}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyMentorships;

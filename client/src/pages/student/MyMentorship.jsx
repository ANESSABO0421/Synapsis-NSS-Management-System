import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, MessageCircle } from "lucide-react";

const MyMentorships = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  const token = localStorage.getItem("token");

  // LOAD MY SESSIONS
  const fetchMySessions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/mentorship/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

      toast.success("Feedback submitted!");
      setShowFeedbackModal(false);
      fetchMySessions();
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  // STATUS STYLING
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    active: "bg-blue-100 text-blue-700 border-blue-300",
    completed: "bg-green-100 text-green-700 border-green-300",
    rejected: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="min-h-screen w-full p-10 bg-gradient-to-b from-emerald-50 via-white to-blue-50">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">
        My Mentorships
      </h1>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {sessions.map((s) => {
          const feedback = s.menteeFeedback;
          return (
            <motion.div
              key={s._id}
              whileHover={{ scale: 1.02, translateY: -3 }}
              className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl shadow-xl border border-white/40 
                         hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelectedSession(s)}
            >
              {/* TOP ROW */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{s.topic}</h2>

                <span
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize shadow-sm border ${statusClasses[s.status]}`}
                >
                  {s.status}
                </span>
              </div>

              {/* MENTOR INFO */}
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-semibold shadow-md">
                  {s.mentor?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{s.mentor?.name}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MessageCircle size={14} /> Mentor
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              {s.description && (
                <p className="mt-4 text-gray-700 leading-relaxed line-clamp-3">
                  {s.description}
                </p>
              )}

              {/* FEEDBACK SUMMARY */}
              {s.status === "completed" && feedback?.rating && (
                <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-inner">
                  <p className="font-semibold text-emerald-700 mb-1 flex items-center gap-2">
                    Your Feedback:
                  </p>

                  {/* STAR RATING */}
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(feedback.rating)].map((_, i) => (
                      <Star key={i} size={18} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>

                  {/* COMMENT */}
                  <p className="text-gray-700 text-sm italic">
                    "{feedback.comment || 'No comment'}"
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex gap-3">

                {/* MEETING LINK */}
                {s.meetingLink && s.status !== "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(s);
                      setShowMeetingModal(true);
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> Meeting Link
                  </button>
                )}

                {/* GIVE FEEDBACK */}
                {s.status === "completed" && !feedback?.rating && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(s);
                      setShowFeedbackModal(true);
                    }}
                    className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700"
                  >
                    Give Feedback ⭐
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* -------------------------------
              MEETING LINK POPUP
      -------------------------------- */}
      <AnimatePresence>
        {showMeetingModal && selectedSession && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white p-7 rounded-2xl w-[380px] shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">Meeting Link</h2>

              <a
                href={selectedSession.meetingLink}
                target="_blank"
                className="text-blue-600 underline font-semibold break-all"
              >
                {selectedSession.meetingLink}
              </a>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------
                FEEDBACK POPUP
      -------------------------------- */}
      <AnimatePresence>
        {showFeedbackModal && selectedSession && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white p-7 rounded-2xl w-[420px] shadow-2xl"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Give Feedback</h2>

              {/* Rating */}
              <p className="font-semibold mb-1">Rating:</p>
              <div className="flex gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFeedbackRating(n)}
                    className={`px-4 py-2 rounded-lg text-lg shadow-sm transition ${
                      feedbackRating === n
                        ? "bg-yellow-400 text-white shadow-md"
                        : "bg-gray-100"
                    }`}
                  >
                    {n} ⭐
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                className="w-full border rounded-lg p-3 shadow-inner"
                rows="3"
                placeholder="Write your feedback..."
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

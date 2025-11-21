import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, Calendar, User, MessageSquare } from "lucide-react";

const AlumniFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadFeedbacks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/mentorship/mentee-feedback/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      console.error("Error fetching mentee feedback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // ⭐ Render Stars
  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={20}
        className={`${
          i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // =======================
  // Loading Screen
  // =======================
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-green-600 text-lg">
        Loading feedback...
      </div>
    );
  }

  // =======================
  // EMPTY STATE
  // =======================
  if (feedbacks.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-lg border text-center w-full max-w-xs sm:max-w-sm">
          <MessageSquare size={50} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-semibold text-gray-700">No Feedback Yet</h2>
          <p className="text-gray-500 text-sm mt-2">
            You don't have any student feedback yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-5 sm:p-8 lg:p-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-green-800 mb-8 sm:mb-10">
        Student Feedback Received
      </h1>

      {/* GRID - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {feedbacks.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-green-100 
                       hover:shadow-2xl transition-all hover:-translate-y-1 cursor-default"
          >
            {/* MENTEE HEADER */}
            <div className="flex items-center gap-4 mb-5">
              <div className="p-4 bg-green-100 rounded-full">
                <User size={26} className="text-green-700" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-green-700 leading-tight">
                  {item.mentee?.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 break-all">
                  {item.mentee?.email}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Rating:</p>
              <div className="flex gap-1">{renderStars(item.feedback.rating)}</div>
            </div>

            {/* Comment */}
            <div className="mt-4">
              <p className="font-semibold text-gray-700 mb-1">Comment:</p>
              <div className="p-3 bg-gray-50 rounded-xl border text-gray-700 text-sm sm:text-base">
                {item.feedback.comment}
              </div>
            </div>

            {/* Session Details */}
            <div className="mt-6 p-4 bg-green-50 rounded-xl border">
              <h3 className="font-bold text-gray-800 flex gap-2 items-center mb-2 text-sm sm:text-base">
                <Calendar size={18} /> Session Details
              </h3>

              <p className="text-gray-700 text-sm sm:text-base">
                <span className="font-semibold">Topic:</span> {item.topic}
              </p>

              <p className="text-gray-700 text-sm sm:text-base mt-1">
                <span className="font-semibold">Description:</span>{" "}
                {item.description || "No description"}
              </p>

              <p className="text-gray-700 text-sm sm:text-base mt-1">
                <span className="font-semibold">Completed On:</span>{" "}
                {item.completedAt
                  ? new Date(item.completedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniFeedback;

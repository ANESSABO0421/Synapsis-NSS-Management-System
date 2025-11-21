import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MentorshipRequest = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  // Fetch mentors of student's institution
  const fetchMentors = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/mentorship/mentors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentors(res.data.mentors || []);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load mentors");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // Send mentorship request
  const sendRequest = async () => {
    if (!selectedMentor) return toast.error("Please select a mentor");
    if (!topic.trim()) return toast.error("Topic is required");

    try {
      await axios.post(
        "http://localhost:3000/api/mentorship/request",
        {
          mentorId: selectedMentor._id,
          topic,
          description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Mentorship request sent!");
      setSelectedMentor(null);
      setTopic("");
      setDescription("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Request a Mentorship
      </h1>
      <p className="text-gray-600 mb-8 sm:mb-10 text-sm sm:text-base">
        Select an alumni mentor and tell them what you'd like to discuss.
      </p>

      {/* MENTOR LIST */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Choose a Mentor
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading mentors...</p>
      ) : mentors.length === 0 ? (
        <p className="text-gray-500">No mentors available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              onClick={() => setSelectedMentor(mentor)}
              className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl border shadow-sm cursor-pointer transition-all 
                ${
                  selectedMentor?._id === mentor._id
                    ? "border-2 border-green-500 bg-green-50"
                    : "bg-white hover:bg-gray-100"
                }`}
            >
              {/* IMAGE */}
              <img
                src={mentor.profileImage?.url || "https://via.placeholder.com/60"}
                alt="mentor"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
              />

              {/* DETAILS */}
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {mentor.name}
                </h3>
                <p className="text-gray-600 text-sm">{mentor.department}</p>
                <p className="text-gray-500 text-xs sm:text-sm">{mentor.email}</p>
              </div>

              {/* SELECT INDICATOR */}
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all 
                  ${
                    selectedMentor?._id === mentor._id
                      ? "border-green-600 bg-green-600"
                      : "border-gray-400"
                  }`}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* FORM */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow">

        {/* Topic */}
        <label className="font-semibold text-gray-700 text-sm sm:text-base">
          Topic *
        </label>
        <input
          type="text"
          className="w-full border p-3 rounded-lg mt-1 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: Web Development, Internship Guidance"
        />

        {/* Description */}
        <label className="font-semibold text-gray-700 text-sm sm:text-base">
          Description (Optional)
        </label>
        <textarea
          className="w-full border p-3 rounded-lg mt-1 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what guidance you need..."
        ></textarea>

        {/* BUTTON */}
        <button
          onClick={sendRequest}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition text-sm sm:text-base"
        >
          Send Mentorship Request
        </button>
      </div>
    </div>
  );
};

export default MentorshipRequest;

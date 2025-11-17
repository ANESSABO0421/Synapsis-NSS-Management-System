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

  // ===========================================
  // 🔹 Fetch mentors of student's institution
  // ===========================================
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

  // ===========================================
  // 🔹 Send Mentorship Request
  // ===========================================
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    <div className="w-full px-6 py-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Request a Mentorship</h1>
      <p className="text-gray-600 mb-10">
        Select an alumni mentor and tell them what you'd like to discuss.
      </p>

      {/* ================== Mentor Selection ================== */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose a Mentor</h2>

      {loading ? (
        <p>Loading mentors...</p>
      ) : mentors.length === 0 ? (
        <p className="text-gray-600">No mentors available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              onClick={() => setSelectedMentor(mentor)}
              className={`flex items-center gap-4 p-5 rounded-xl border shadow-sm cursor-pointer transition-all 
                ${
                  selectedMentor?._id === mentor._id
                    ? "border-2 border-green-500 bg-green-50"
                    : "hover:bg-gray-100"
                }`}
            >
              {/* Profile Image */}
              <img
                src={mentor.profileImage?.url || "https://via.placeholder.com/60"}
                alt="mentor"
                className="w-14 h-14 rounded-full object-cover"
              />

              <div>
                <h3 className="text-lg font-semibold text-gray-800">{mentor.name}</h3>
                <p className="text-gray-600 text-sm">{mentor.department}</p>
                <p className="text-gray-500 text-sm">{mentor.email}</p>
              </div>

              {/* Selection dot */}
              <div
                className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    selectedMentor?._id === mentor._id
                      ? "border-green-600 bg-green-600"
                      : "border-gray-400"
                  }
                `}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* ================== Form Section ================== */}
      <div className="bg-white rounded-xl p-6 shadow">
        
        {/* Topic */}
        <label className="font-semibold text-gray-700">Topic *</label>
        <input
          type="text"
          className="w-full border p-3 rounded-lg mt-1 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: MERN Stack, Web Development"
        />

        {/* Description */}
        <label className="font-semibold text-gray-700">Description (Optional)</label>
        <textarea
          className="w-full border p-3 rounded-lg mt-1 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what guidance you need..."
        ></textarea>

        {/* Send Button */}
        <button
          onClick={sendRequest}
          className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition"
        >
          Send Mentorship Request
        </button>
      </div>
    </div>
  );
};

export default MentorshipRequest;

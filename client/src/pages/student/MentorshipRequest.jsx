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

  // ===============================
  // 🔹 FETCH MENTORS FROM INSTITUTION
  // ===============================
  const fetchMentors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/mentorship/mentors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMentors(res.data.mentors || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mentors");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // ===============================
  // 🔹 SEND MENTORSHIP REQUEST
  // ===============================
  const sendRequest = async () => {
    if (!selectedMentor) return toast.error("Please select a mentor");
    if (!topic.trim()) return toast.error("Topic is required");

    try {
      const res = await axios.post(
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
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4">Request a Mentorship</h1>

      {/* ====================== Mentor List ====================== */}
      <h2 className="font-semibold mb-2">Choose a Mentor</h2>

      {loading ? (
        <p>Loading mentors...</p>
      ) : mentors.length === 0 ? (
        <p className="text-gray-600">No mentors available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              onClick={() => setSelectedMentor(mentor)}
              className={`border p-4 rounded-lg cursor-pointer transition shadow-sm ${
                selectedMentor?._id === mentor._id
                  ? "bg-green-100 border-green-500"
                  : "hover:bg-gray-100"
              }`}
            >
              <h3 className="text-lg font-bold">{mentor.name}</h3>
              <p className="text-gray-700">{mentor.department}</p>
              <p className="text-gray-500">{mentor.email}</p>
            </div>
          ))}
        </div>
      )}

      {/* ====================== Form Inputs ====================== */}
      <div className="mb-4">
        <label className="font-semibold">Topic *</label>
        <input
          type="text"
          className="w-full border p-2 rounded mt-1"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: MERN Stack, Web Development"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Description (Optional)</label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what guidance you need..."
        ></textarea>
      </div>

      {/* ====================== Send Button ====================== */}
      <button
        onClick={sendRequest}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Send Mentorship Request
      </button>
    </div>
  );
};

export default MentorshipRequest;

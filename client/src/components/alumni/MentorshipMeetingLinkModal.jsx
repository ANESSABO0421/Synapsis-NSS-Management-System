import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MentorshipMeetingLinkModal = ({ mentorshipId, onClose }) => {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ===========================
  // FETCH EXISTING MEETING LINK
  // ===========================
  const fetchLink = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/mentorship/mentor`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mentorship = res.data.requests.find(
        (item) => item._id === mentorshipId
      );

      if (mentorship?.meetingLink) setLink(mentorship.meetingLink);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meeting link");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLink();
  }, []);

  // ===========================
  // SAVE MEETING LINK
  // ===========================
  const saveLink = async () => {
    if (!link.trim()) return toast.error("Link cannot be empty");

    try {
      await axios.put(
        `http://localhost:3000/api/mentorship/${mentorshipId}/meeting-link`,
        { link },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Meeting link updated!");
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      toast.error("Failed to save meeting link");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-[999]">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 animate-[fadeIn_0.3s]">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Add / Update Meeting Link
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            <label className="block mb-1 font-semibold text-gray-700">
              Google Meet / Zoom Link
            </label>

            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste your meeting link here..."
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
            />

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={saveLink}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
              >
                Save Link
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MentorshipMeetingLinkModal;

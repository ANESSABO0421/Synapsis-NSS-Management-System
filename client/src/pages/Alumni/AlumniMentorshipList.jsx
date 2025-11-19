import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AlumniMentorshipList = () => {
  const [mentorships, setMentorships] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = location.pathname.split("/").pop(); // Highlight current chat

  const loadMentorships = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/mentorshipmessage/allalumni",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMentorships(res.data.mentorships || []);
    } catch (err) {
      console.error("Failed to load mentorships", err);
    }
  };

  useEffect(() => {
    loadMentorships();

    // AUTO REFRESH LIST EVERY 2 SECONDS FOR LIVE UPDATES
    const interval = setInterval(loadMentorships, 2000);
    return () => clearInterval(interval);

  }, []);

  return (
    <div className="p-4">
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-green-700 mb-6 tracking-wide">
        Mentorship Chats
      </h2>

      {/* LIST */}
      <div className="space-y-3">
        {mentorships.map((m) => {
          const isActive = activeId === m._id;

          return (
            <div
              key={m._id}
              onClick={() =>
                navigate(`/alumnilayout/mentorshipchatlayout/mentorshipchat/${m._id}`)
              }
              className={`p-4 rounded-xl border shadow-md cursor-pointer transition-all 
                ${isActive ? 
                  "bg-green-700 text-white border-green-900" :
                  "bg-white hover:bg-green-50 border-green-200"
                }`
              }
            >
              <h3 className={`font-semibold text-lg ${isActive ? "text-white" : "text-green-800"}`}>
                {m.topic}
              </h3>

              <p className={`text-sm mt-1 ${isActive ? "text-green-100" : "text-gray-600"}`}>
                Student: {m.mentee?.name}
              </p>

              <span className={`text-xs mt-2 inline-block px-2 py-1 rounded-full 
                ${isActive ? 
                  "bg-white text-green-700" : 
                  "bg-green-100 text-green-700"
                }`}
              >
                Active
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlumniMentorshipList;

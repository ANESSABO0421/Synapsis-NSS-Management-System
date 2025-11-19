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
    const interval = setInterval(loadMentorships, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5">

      {/* HEADER */}
      <h2 className="text-3xl font-extrabold text-green-700 mb-7 tracking-wide drop-shadow-sm">
        Mentorship Chats
      </h2>

      {/* LIST */}
      <div className="space-y-4">
        {mentorships.map((m) => {
          const isActive = activeId === m._id;

          return (
            <div
              key={m._id}
              onClick={() =>
                navigate(`/alumnilayout/mentorshipchatlayout/mentorshipchat/${m._id}`)
              }
              className={`
                rounded-2xl p-5 cursor-pointer transition-all duration-300 
                shadow-sm hover:shadow-lg border backdrop-blur-md
                ${isActive
                  ? "bg-gradient-to-r from-green-700 to-green-600 text-white border-green-800 shadow-xl scale-[1.02]"
                  : "bg-white/80 border-gray-200 hover:bg-green-50 hover:border-green-300"
                }
              `}
            >
              {/* Topic */}
              <h3
                className={`font-semibold text-xl mb-1 
                ${isActive ? "text-white" : "text-green-800"}
              `}
              >
                {m.topic}
              </h3>

              {/* Student Name */}
              <p
                className={`text-sm mb-2 
                ${isActive ? "text-green-100" : "text-gray-600"}
              `}
              >
                Student: {m.mentee?.name}
              </p>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium tracking-wide shadow-sm
                ${isActive
                  ? "bg-white text-green-700"
                  : "bg-green-100 text-green-700"
                }
              `}
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

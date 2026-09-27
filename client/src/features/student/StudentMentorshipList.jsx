"use client";

import { getToken } from "@/utils/auth";
import { API_URL } from "@/utils/config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const StudentMentorshipList = () => {
  const [mentorships, setMentorships] = useState([]);
  const navigate = useRouter();
  const token = getToken();

  const loadMentorships = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/mentorshipmessage/allstudent`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMentorships(res.data.mentorships || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMentorships();
  }, []);

  return (
    <div className="h-full p-4">
      <h1 className="text-xl font-bold text-green-700 mb-4">
        Mentorship Chats
      </h1>

      {mentorships.length === 0 && (
        <p className="text-gray-600 text-sm">No active mentorship sessions.</p>
      )}

      <div className="space-y-3">
        {mentorships.map((m) => (
          <div
            key={m._id}
            onClick={() =>
              navigate.push(
                `/studentlayout/mentorshipchatlayout/chat/${m._id}`
              )
            }
            className="cursor-pointer bg-white p-4 rounded-xl border border-green-200
                       shadow-sm hover:bg-blue-50 hover:border-green-500
                       transition-all"
          >
            <h2 className="font-semibold text-green-700">{m.topic}</h2>
            <p className="text-sm text-gray-600">
              Mentor: {m.mentor?.name}
            </p>

            <span className="text-xs mt-2 inline-block px-2 py-1 bg-blue-100 text-green-700 rounded-full">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentMentorshipList;

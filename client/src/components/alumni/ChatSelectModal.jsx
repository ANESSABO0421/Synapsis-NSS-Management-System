import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ChatSelectModal = ({ close }) => {
  const [chats, setChats] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const loadMentorships = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/mentorshipmessage/allalumni",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(res.data)
        setChats(res.data.mentorships || []);
      } catch (err) {
        console.log("Failed to load mentorships");
      }
    };

    loadMentorships();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm 
                 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white p-6 rounded-2xl w-[380px] shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Select Chat</h2>

        {chats.length === 0 ? (
          <p className="text-gray-500">No active mentorships found.</p>
        ) : (
          <div className="space-y-3">
            {chats.map((c) => (
              <div
                key={c._id}
                className="p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  navigate(`/alumnilayout/mentorshipchat/${c._id}`);
                  close();
                }}
              >
                <p className="font-semibold">{c.mentee?.name}</p>
                <p className="text-sm text-gray-600">{c.mentee?.email}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={close}
          className="mt-5 w-full bg-red-500 text-white py-2 rounded-xl"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ChatSelectModal;

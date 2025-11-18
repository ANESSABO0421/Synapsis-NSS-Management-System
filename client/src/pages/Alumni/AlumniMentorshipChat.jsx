import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { toast } from "react-toastify";

// SOCKET CONNECTION
const socket = io("http://localhost:3000/mentorship-chat", {
  transports: ["websocket"],
  auth: { token: localStorage.getItem("token") },
});

const AlumniMentorshipChat = () => {
  const { mentorshipId } = useParams();   // 🔥 ALWAYS WORKS NOW
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");
  const role = "alumni";

  // 🔥 Load Messages from Backend
  const loadMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/mentorshipmessage/alumnichat/${mentorshipId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      toast.error("Failed to load messages");
    }
  };

  // 🔥 Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    // 🔥 Realtime message emit
    socket.emit("sendMentorMessage", {
      mentorshipId,
      message: input,
    });

    // 🔥 Save message in DB
    await axios.post(
      `http://localhost:3000/api/mentorshipmessage/alumnichat/${mentorshipId}`,
      { message: input },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setInput("");
  };

  useEffect(() => {
    loadMessages();
    socket.emit("joinMentorship", { mentorshipId });

    socket.on("newMentorMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => socket.off("newMentorMessage");
  }, [mentorshipId]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-200">

      {/* Header */}
      <div className="p-4 bg-green-700 text-white shadow-md flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
          💬
        </div>
        <h1 className="font-bold text-xl">Alumni Mentorship Chat</h1>
      </div>

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.senderRole === role ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-sm shadow-md ${
                msg.senderRole === role
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border rounded-bl-none"
              }`}
            >
              <p>{msg.message}</p>

              <div className="text-[10px] opacity-70 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition shadow-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AlumniMentorshipChat;

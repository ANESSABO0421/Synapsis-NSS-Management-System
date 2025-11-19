import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3000/mentorship-chat", {
  transports: ["websocket"],
  auth: { token: localStorage.getItem("token") },
});

const AlumniMentorshipChat = () => {
  const { mentorshipId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeout = useRef(null);

  /* =======================================================
      LOAD PREVIOUS MESSAGES
  ======================================================== */
  const loadMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/mentorshipmessage/alumnichat/${mentorshipId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(res.data.messages || []);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  /* =======================================================
      SOCKET SEND
  ======================================================== */
  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("sendMentorMessage", {
      mentorshipId,
      message: input,
    });

    setInput("");
    setShowEmoji(false);
  };

  /* =======================================================
      TYPING INDICATOR
  ======================================================== */
  const handleTyping = (e) => {
    setInput(e.target.value);

    socket.emit("typing", { mentorshipId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { mentorshipId });
    }, 1500);
  };

  /* =======================================================
      SOCKET LISTENERS
  ======================================================== */
  useEffect(() => {
    loadMessages();
    socket.emit("joinMentorship", { mentorshipId });

    socket.on("newMentorMessage", (msg) => {
      if (msg.mentorship === mentorshipId) {
        setMessages((prev) => [...prev, msg]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("newMentorMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [mentorshipId]);

  /* =======================================================
      CLOSE EMOJI PICKER ON OUTSIDE CLICK
  ======================================================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =======================================================
      UI
  ======================================================== */
  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* HEADER */}
      <div className="p-4 bg-green-700 text-white font-bold flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
          <span>Student (Online)</span>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.senderRole === "alumni" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
                msg.senderRole === "alumni"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-white border border-gray-300 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <div className="text-[10px] mt-1 opacity-70 flex justify-end">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="text-xs text-gray-500 italic ml-2">typing…</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-white border-t flex items-center gap-3 shadow-inner relative">

        {/* EMOJI BUTTON */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmoji((prev) => !prev)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-all"
          >
            <Smile size={20} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-20 shadow-lg">
              <EmojiPicker
                theme="light"
                height={350}
                width={300}
                onEmojiClick={(emoji) => setInput((prev) => prev + emoji.emoji)}
              />
            </div>
          )}
        </div>

        {/* INPUT BOX */}
        <input
          value={input}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        {/* SEND BTN */}
        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-md flex items-center justify-center transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlumniMentorshipChat;

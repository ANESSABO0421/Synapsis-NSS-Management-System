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

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("sendMentorMessage", {
      mentorshipId,
      message: input,
    });

    setInput("");
    setShowEmoji(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    socket.emit("typing", { mentorshipId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { mentorshipId });
    }, 1500);
  };

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-100 to-white">

      {/* HEADER */}
      <div className="
        p-4 
        bg-white/70 
        backdrop-blur-md 
        border-b 
        border-green-200 
        font-semibold 
        shadow-lg 
        flex items-center justify-between
      ">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-800 tracking-wide font-bold">Student (Online)</span>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.senderRole === "alumni" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-lg animate-[fadeIn_0.25s_ease-out] 
              ${
                msg.senderRole === "alumni"
                  ? "bg-gradient-to-br from-green-600 to-green-500 text-white rounded-br-none shadow-green-300/30"
                  : "bg-white/90 border border-gray-200 rounded-bl-none backdrop-blur-md"
              }`}
            >
              <p className="text-[15px] leading-snug">{msg.message}</p>
              <div className="text-[10px] mt-1 opacity-60 flex justify-end">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="text-xs text-gray-500 italic ml-2 animate-pulse">typing…</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="
        p-3 bg-white/80 backdrop-blur-md border-t border-green-100 
        flex items-center gap-3 shadow-2xl relative
      ">

        {/* EMOJI BUTTON */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmoji((prev) => !prev)}
            className="p-2 text-green-700 hover:bg-green-100 rounded-full transition-all shadow-sm"
          >
            <Smile size={22} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-40 shadow-2xl">
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
          className="
            flex-1 border border-gray-300 rounded-full px-4 py-2 
            focus:ring-2 focus:ring-green-500 outline-none text-sm
            shadow-sm bg-white/90 backdrop-blur-md
          "
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        {/* SEND BTN */}
        <button
          onClick={sendMessage}
          className="
            bg-green-600 hover:bg-green-700 text-white 
            p-3 rounded-full shadow-lg 
            transition-all active:scale-95
          "
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlumniMentorshipChat;

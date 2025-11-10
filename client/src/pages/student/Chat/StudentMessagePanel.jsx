import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send, Smile, Loader2 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const StudentMessagePanel = ({ event, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 🔔 Play sound when new message arrives
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.4;
    audio.play();
  };

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/events/${event._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) setMessages(res.data.messages);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [event, token]);

  // Join socket room & listen for messages
  useEffect(() => {
    socket.emit("join_event", event._id);

    socket.on("receive_message", (msg) => {
      if (msg.eventId === event._id) {
        setMessages((prev) => [...prev, msg]);
        playNotificationSound();
        document.title = "🔔 New Message | NSS Chat";
        setTimeout(() => (document.title = "NSS Chat"), 3000);
      }
    });

    socket.on("user_typing", (data) => {
      if (data.eventId === event._id) {
        setTypingUser(data.name);
        setTimeout(() => setTypingUser(null), 2000);
      }
    });

    return () => {
      socket.emit("leave_event", event._id);
      socket.off("receive_message");
      socket.off("user_typing");
    };
  }, [socket, event]);

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const msgData = { eventId: event._id, content: newMsg };

    try {
      const res = await axios.post("http://localhost:3000/api/chat/student/send", msgData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const savedMsg = res.data.message;
        setMessages((prev) => [...prev, savedMsg]);
        socket.emit("send_message", savedMsg);
        setNewMsg("");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  // Typing event
  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    socket.emit("typing", { eventId: event._id, name: "Student" });
  };

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker on outside click
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
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-green-50 to-emerald-50 shadow-lg rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-700 to-emerald-600 text-white flex items-center justify-between">
        <h2 className="font-semibold text-lg truncate">{event.title}</h2>
        <span className="text-sm opacity-80">Student Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center items-center h-full text-green-600">
            <Loader2 className="animate-spin mr-2" /> Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full justify-center items-center text-gray-500 italic">
            No messages yet. Start chatting 💬
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine =
              msg.sender?.role?.toLowerCase() === "student" ||
              msg.sender?.role?.toLowerCase() === "volunteer";
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={idx} className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md ${
                    isMine
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <div className="flex justify-between mt-1 text-[10px] opacity-70">
                    <span>{msg.sender?.name || msg.sender?.role}</span>
                    <span>{time}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="text-xs text-gray-500 italic px-4 mb-2">
            {typingUser} is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input + Emoji */}
      <div className="p-3 border-t bg-white flex items-center gap-3 relative">
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
                searchDisabled={false}
                onEmojiClick={(emoji) => setNewMsg((prev) => prev + emoji.emoji)}
              />
            </div>
          )}
        </div>

        <input
          value={newMsg}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
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

export default StudentMessagePanel;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";

const TeacherMessagePanel = ({ event, socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  // 🟢 Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/events/${event._id}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(res.data)

        // Backend: { success, messages: [] }
        if (res.data?.messages) setMessages(res.data.messages);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [event, token]);

  // 🟢 Handle socket join + new messages
  useEffect(() => {
    socket.emit("joinEvent", event._id);

    socket.on("receiveMessage", (msg) => {
      if (msg.eventId === event._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit("leaveEvent", event._id);
      socket.off("receiveMessage");
    };
  }, [socket, event]);

  // 🟢 Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const msgData = {
      eventId: event._id,
      content: input,
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat/teacher/send",
        msgData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.message) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        socket.emit("sendMessage", newMsg);
        setInput("");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  // 🟢 Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-green-600 text-white flex items-center justify-between">
        <h2 className="font-semibold text-lg truncate">
          {event.name || "Event Chat"}
        </h2>
        <span className="text-sm text-green-100">Teacher Chat Room</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex h-full justify-center items-center text-gray-500 italic">
            No messages yet. Start the conversation 💬
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isTeacher = msg.sender?.role === "teacher";
            return (
              <div
                key={idx}
                className={`flex w-full mb-3 ${
                  isTeacher ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[60%] px-4 py-2 rounded-2xl text-sm sm:text-base shadow-sm ${
                    isTeacher
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isTeacher ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {msg.sender?.name || msg.sender?.role || "User"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t bg-white flex items-center gap-2 sm:gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-700 transition-all text-white p-2 sm:p-2.5 rounded-full shadow-md flex items-center justify-center"
        >
          <Send size={18} className="sm:size-5" />
        </button>
      </div>
    </div>
  );
};

export default TeacherMessagePanel;

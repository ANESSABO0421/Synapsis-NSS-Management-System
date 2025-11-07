import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";

const MessagePanel = ({ event, socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/events/${event._id}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data?.success) setMessages(res.data.messages);
      } catch (err) {
        console.error("❌ Error loading messages:", err);
      }
    };
    fetchMessages();
  }, [event, token]);

  // Socket join/leave and listener
  useEffect(() => {
    socket.emit("join_event", event._id);
    socket.on("receive_message", (msg) => {
      if (msg.eventId === event._id) setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.emit("leave_event", event._id);
      socket.off("receive_message");
    };
  }, [socket, event]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msgData = { eventId: event._id, content: input };

    try {
      const res = await axios.post(
        `http://localhost:3000/api/chat/coordinator/send`,
        msgData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const savedMsg = res.data.message;
        setMessages((prev) => [...prev, savedMsg]);
        socket.emit("send_message", savedMsg);
        setInput("");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 shadow-lg rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-green-700 text-white flex items-center justify-between">
        <h2 className="font-semibold text-lg truncate">
          {event.title || event.name || "Untitled Event"}
        </h2>
        <span className="text-sm text-green-100">Coordinator Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex h-full justify-center items-center text-gray-500 italic">
            No messages yet. Start the conversation 💬
          </div>
        ) : (
          messages.map((msg, idx) => {
            // Determine who sent the message
            const isSentByCoordinator =
              msg.sender?.role?.toLowerCase() === "coordinator";

            return (
              <div
                key={idx}
                className={`flex w-full mb-3 ${
                  isSentByCoordinator ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[60%] px-4 py-2 rounded-2xl text-sm sm:text-base shadow-md ${
                    isSentByCoordinator
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isSentByCoordinator ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {msg.sender?.name || msg.sender?.role || "Unknown"}
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
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

export default MessagePanel;
  
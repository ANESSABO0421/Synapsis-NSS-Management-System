import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";

const StudentMessagePanel = ({ event, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  // Fetch previous messages
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

  // Join event room + socket listeners
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
    if (!newMsg.trim()) return;
    const msgData = { eventId: event._id, content: newMsg };

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat/student/send",
        msgData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        <span className="text-sm text-green-100">Student Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center items-center h-full text-green-600">
            <Loader2 className="animate-spin mr-2" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full justify-center items-center text-gray-500 italic">
            No messages yet. Start the conversation 💬
          </div>
        ) : (
          messages.map((msg, idx) => {
            // Determine if message is sent by this student
            const isSentByStudent =
              msg.sender?.role?.toLowerCase() === "volunteer" ||
              msg.sender?.role?.toLowerCase() === "student";

            return (
              <div
                key={idx}
                className={`flex w-full mb-3 ${
                  isSentByStudent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[60%] px-4 py-2 rounded-2xl text-sm sm:text-base shadow-md ${
                    isSentByStudent
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isSentByStudent ? "text-green-100" : "text-gray-400"
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
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
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

export default StudentMessagePanel;

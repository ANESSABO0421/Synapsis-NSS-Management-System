"use client";

import { getToken } from "@/utils/auth";
import { API_URL } from "@/utils/config";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessagePanel = ({ event, socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const token = getToken();
  const bottomRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/chat/events/${event._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) setMessages(res.data.messages);
      } catch (err) {
        console.error("❌ Error loading messages:", err);
      }
    };
    fetchMessages();
  }, [event, token]);

  // Socket listeners
  useEffect(() => {
    socket.emit("join_event", event._id);

    socket.on("receive_message", (msg) => {
      if (msg.eventId === event._id) {
        setMessages((prev) => [...prev, msg]);
      }
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
        `${API_URL}/api/chat/coordinator/send`,
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

  // Emoji select
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 shadow-lg rounded-2xl overflow-hidden relative">

      {/* Header */}
      <div className="p-4 border-b bg-green-700 text-white flex items-center justify-between">
        <h2 className="font-semibold text-lg truncate">{event.title}</h2>
        <span className="text-sm text-green-100">Coordinator Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-green-400">
        {messages.length === 0 ? (
          <div className="flex h-full justify-center items-center text-gray-500 italic">
            No messages yet. Start the conversation 💬
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isCoordinator =
              msg.sender?.role?.toLowerCase() === "coordinator";

            return (
              <div
                key={idx}
                className={`flex w-full mb-3 ${
                  isCoordinator ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-[60%] px-4 py-2 rounded-2xl text-sm sm:text-base shadow-md ${
                    isCoordinator
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isCoordinator ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {msg.sender?.name}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker ABOVE THE BUTTON */}
      {showEmoji && (
        <div className="absolute bottom-[70px] left-3 sm:left-4 z-20">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t bg-white flex items-center gap-2">
        <button
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
        >
          <Smile size={22} className="text-gray-600" />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-700 text-white p-2 sm:p-3 rounded-full shadow-md"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessagePanel;

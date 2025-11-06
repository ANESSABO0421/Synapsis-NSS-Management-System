import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";

const ChatPanel = ({ institutionId, eventId, user }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_room", { institutionId, eventId });

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leave_room", { institutionId, eventId });
      socket.off("new_message");
    };
  }, [socket, institutionId, eventId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("send_message", { institutionId, eventId, content: text });
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[70%] ${
              m.sender?.id === user?.id
                ? "bg-green-600 ml-auto"
                : "bg-gray-700"
            }`}
          >
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex p-2 bg-gray-800 border-t border-gray-700">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 px-3 py-2 rounded-lg outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

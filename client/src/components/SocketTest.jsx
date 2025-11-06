import React, { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const SocketTest = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    console.log("✅ Socket connected:", socket.id);

    // listen for test message from server
    socket.on("server-message", (msg) => {
      console.log("📩 Received from server:", msg);
    });

    // emit a message to server for testing
    socket.emit("client-message", "Hello from frontend!");

    return () => {
      socket.off("server-message");
    };
  }, [socket]);

  return <div style={{ color: "limegreen" }}>Socket Test Component Active ⚡</div>;
};

export default SocketTest;

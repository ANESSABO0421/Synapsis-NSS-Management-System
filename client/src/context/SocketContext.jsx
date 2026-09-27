"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- the socket is an external system; it can only be created client-side after mount
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => newSocket.disconnect();
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

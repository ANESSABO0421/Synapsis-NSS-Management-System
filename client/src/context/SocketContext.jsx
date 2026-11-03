"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/utils/config";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Logged-out visitors don't need a socket (the server would reject it anyway).
    if (!token) return;
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- the socket is an external system; it can only be created client-side after mount
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connection failed:", err.message);
    });

    return () => newSocket.disconnect();
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

/**
 * Per-namespace socket (e.g. "/mentorship-chat"), created after mount with the
 * current token and closed on unmount. Returns null until connected-ready.
 */
export const useNamespaceSocket = (namespace) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const s = io(`${SOCKET_URL}${namespace}`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external system, client-only
    setSocket(s);
    return () => s.disconnect();
  }, [namespace]);

  return socket;
};

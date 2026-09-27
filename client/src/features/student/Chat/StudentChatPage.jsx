"use client";

import { getToken } from "@/utils/auth";
import { API_URL } from "@/utils/config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import StudentEventList from "./StudentEventList";
import StudentMessagePanel from "./StudentMessagePanel";
import { MessageSquare, Loader2, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const socket = io(`${API_URL}`, {
  transports: ["websocket", "polling"],
});

const StudentChatPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  const token = getToken();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/students/my-events`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("❌ Error fetching student events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  return (
    <div className="relative h-[85vh] w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-200 bg-gradient-to-br from-green-50 via-white to-emerald-100 flex">

      {/* ---------- MOBILE TOGGLE BUTTON ---------- */}
      <button
        className="sm:hidden absolute top-3 left-3 z-[60] bg-emerald-600 text-white p-2 rounded-full shadow-md"
        onClick={() => setOpenMobileSidebar(true)}
      >
        <PanelLeft size={20} />
      </button>

      {/* ---------- DESKTOP SIDEBAR ---------- */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="hidden sm:block w-1/3 border-r border-emerald-200 bg-gradient-to-b from-white/90 to-green-50/80 backdrop-blur-xl"
      >
        {loading ? (
          <div className="flex flex-col h-full justify-center items-center text-emerald-600 gap-2">
            <Loader2 className="animate-spin" size={30} />
            <p className="text-sm">Loading your events...</p>
          </div>
        ) : (
          <StudentEventList
            events={events}
            onSelect={setSelectedEvent}
            selected={selectedEvent}
          />
        )}
      </motion.div>

      {/* ---------- MOBILE SIDEBAR (DRAWER) ---------- */}
      <AnimatePresence>
        {openMobileSidebar && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-72 bg-white z-[70] border-r border-emerald-200 shadow-2xl sm:hidden overflow-y-auto"
          >
            <div className="p-3 border-b flex justify-between items-center bg-emerald-600 text-white">
              <h2 className="text-lg font-semibold">Your Events</h2>
              <button
                onClick={() => setOpenMobileSidebar(false)}
                className="text-white"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col h-full justify-center items-center text-emerald-600 gap-2">
                <Loader2 className="animate-spin" size={28} />
                <p className="text-sm">Loading your events...</p>
              </div>
            ) : (
              <StudentEventList
                events={events}
                onSelect={(ev) => {
                  setSelectedEvent(ev);
                  setOpenMobileSidebar(false);
                }}
                selected={selectedEvent}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- CHAT PANEL ---------- */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {selectedEvent ? (
            <motion.div
              key={selectedEvent._id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <StudentMessagePanel event={selectedEvent} socket={socket} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full items-center justify-center text-gray-500"
            >
              <div className="bg-emerald-100 text-emerald-600 p-5 rounded-full shadow-lg mb-3">
                <MessageSquare size={36} />
              </div>
              <p className="text-lg font-semibold">Select an event to start chatting 💬</p>
              <p className="text-sm text-gray-400 mt-1">Your event chats will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentChatPage;

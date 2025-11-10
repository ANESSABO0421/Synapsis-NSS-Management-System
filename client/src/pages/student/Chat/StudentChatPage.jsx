import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import StudentEventList from "./StudentEventList";
import StudentMessagePanel from "./StudentMessagePanel";
import { MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const socket = io("http://localhost:3000", { transports: ["websocket", "polling"] });

const StudentChatPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/students/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <div className="relative h-[85vh] w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-200 bg-gradient-to-br from-green-50 via-white to-emerald-100 flex backdrop-blur-lg">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="w-full sm:w-1/3 border-r border-emerald-200 bg-gradient-to-b from-white/90 to-green-50/80 backdrop-blur-xl"
      >
        {loading ? (
          <div className="flex flex-col h-full justify-center items-center text-emerald-600 gap-2">
            <Loader2 className="animate-spin" size={30} />
            <p className="text-sm">Loading your events...</p>
          </div>
        ) : (
          <StudentEventList events={events} onSelect={setSelectedEvent} selected={selectedEvent} />
        )}
      </motion.div>

      {/* Chat Window */}
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

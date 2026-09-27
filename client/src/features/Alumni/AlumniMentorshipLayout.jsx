"use client";

import React, { useState } from "react";

import AlumniMentorshipList from "./AlumniMentorshipList";
import { PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AlumniMentorshipLayout = ({ children }) => {
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-100 to-gray-300 relative">

      {/* ---------- MOBILE TOGGLE BUTTON ---------- */}
      <button
        className="sm:hidden absolute top-4 left-4 z-[60] bg-gray-800 text-white p-2 rounded-full shadow-md"
        onClick={() => setOpenMobileSidebar(true)}
      >
        <PanelLeft size={20} />
      </button>

      {/* ---------- DESKTOP SIDEBAR ---------- */}
      <div
        className="
          hidden sm:block
          w-1/3 
          border-r 
          bg-white/70 
          backdrop-blur-xl 
          shadow-[4px_0_20px_rgba(0,0,0,0.08)] 
          overflow-y-auto 
          transition-all duration-300
        "
      >
        <AlumniMentorshipList />
      </div>

      {/* ---------- MOBILE SIDEBAR (DRAWER) ---------- */}
      <AnimatePresence>
        {openMobileSidebar && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.3 }}
            className="
              fixed top-0 left-0 
              h-full w-72 
              bg-white 
              z-[70] 
              border-r 
              shadow-xl 
              sm:hidden 
              overflow-y-auto
            "
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white">
              <h2 className="text-lg font-semibold">Mentorship Chats</h2>
              <button
                className="text-white text-xl"
                onClick={() => setOpenMobileSidebar(false)}
              >
                ✕
              </button>
            </div>

            <AlumniMentorshipList
              onSelect={() => setOpenMobileSidebar(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- RIGHT PANEL (CHAT WINDOW) ---------- */}
      <div
        className="
          flex-1 
          bg-gradient-to-br from-white to-gray-100 
          shadow-inner 
          rounded-l-3xl 
          overflow-hidden 
          border-l border-white/40
        "
      >
        {children}
      </div>
    </div>
  );
};

export default AlumniMentorshipLayout;

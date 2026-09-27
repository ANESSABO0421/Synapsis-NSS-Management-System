"use client";

import React, { useState } from "react";

import StudentMentorshipList from "./StudentMentorshipList";
import { PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StudentMentorshipLayout = ({ children }) => {
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  return (
    <div className="h-screen flex bg-gray-100 relative">

      {/* ---------- MOBILE TOGGLE BUTTON ---------- */}
      <button
        className="sm:hidden absolute top-4 left-4 z-[60] bg-gray-800 text-white p-2 rounded-full shadow-md"
        onClick={() => setOpenMobileSidebar(true)}
      >
        <PanelLeft size={20} />
      </button>

      {/* ---------- DESKTOP SIDEBAR ---------- */}
      <div className="hidden sm:block w-1/3 border-r bg-white overflow-y-auto">
        <StudentMentorshipList />
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
            {/* Drawer Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white">
              <h2 className="text-lg font-semibold">Mentorship Chats</h2>
              <button
                onClick={() => setOpenMobileSidebar(false)}
                className="text-white text-xl"
              >
                ✕
              </button>
            </div>

            <StudentMentorshipList
              onSelect={() => setOpenMobileSidebar(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- RIGHT CHAT PANEL ---------- */}
      <div className="flex-1 bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default StudentMentorshipLayout;

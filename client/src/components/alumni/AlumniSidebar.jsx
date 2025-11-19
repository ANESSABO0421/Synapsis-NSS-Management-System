import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaRegCommentDots,
  FaCalendarCheck,
  FaHome,
} from "react-icons/fa";
import { BiComment, BiCommentDetail } from "react-icons/bi";

import ChatSelectModal from "./ChatSelectModal";
import { MdFeedback } from "react-icons/md";

const AlumniSidebar = ({ setIsOpen }) => {
  const [showChatModal, setShowChatModal] = useState(false);

  const handleClose = () => {
    if (setIsOpen) setIsOpen(false);
  };

  const navItems = [
    { to: "/alumnilayout/dashboard", icon: <FaHome />, label: "Dashboard" },
    {
      to: "/alumnilayout/managementorship",
      icon: <FaChalkboardTeacher />,
      label: "Manage Mentorship",
    },
    {
      to: "/alumnilayout/testimonials",
      icon: <FaRegCommentDots />,
      label: "Testaimonials",
    },
    {
      to: "/alumnilayout/donations",
      icon: <FaCalendarCheck />,
      label: "Donations",
    },
    {
      to: "/alumnilayout/alumniprofile",
      icon: <FaUserGraduate />,
      label: "My Profile",
    },
    {
      to: "/alumnilayout/feedback",
      icon: <MdFeedback />,
      label: "Feedback",
    },
    {
      to: "/alumnilayout/mentorshipchatlayout",
      icon: <BiCommentDetail />,
      label: "Mentorship Chat",
    },
  ];

  return (
    <>
      {/* =========================
          ⭐ SIDEBAR
      ========================== */}
      <motion.aside
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-64 h-screen bg-gradient-to-b from-green-800 via-green-700 to-green-900 
                   text-white flex flex-col shadow-2xl border-r border-green-600 
                   fixed lg:static top-0 left-0 z-50"
      >
        {/* Title */}
        <div className="p-5 text-center font-extrabold text-3xl tracking-wide bg-green-900/40 border-b border-green-600">
          <span className="bg-gradient-to-r from-lime-400 to-green-300 bg-clip-text text-transparent">
            Synapsis
          </span>{" "}
          Alumni
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-green-500/30 text-white border border-green-400 shadow-inner"
                    : "hover:bg-green-700/40 text-gray-100"
                }`
              }
            >
              <div className="text-lg group-hover:scale-110 transition">{icon}</div>
              <span>{label}</span>
            </NavLink>
          ))}

          {/* ==========================
             ⭐ MENTORSHIP CHAT BUTTON
          ============================ */}
          {/* <button
            onClick={() => {
              setShowChatModal(true);
              handleClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl 
                       bg-green-600 hover:bg-green-700 transition mt-4"
          >
            <BiComment className="text-xl" />
            <span className="font-medium">Mentorship Chat</span>
          </button> */}
        </nav>
      </motion.aside>

      {/* ==========================
           ⭐ CHAT SELECTION MODAL
      ============================ */}
      {/* {showChatModal && (
        <ChatSelectModal
          close={() => setShowChatModal(false)}
        />
      )} */}
    </>
  );
};

export default AlumniSidebar;

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaRegCommentDots,
  FaCalendarCheck,
  FaHome,
} from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";
import { MdFeedback } from "react-icons/md";

const AlumniSidebar = ({ setIsOpen }) => {
  const [showChatModal, setShowChatModal] = useState(false);

  const handleClose = () => {
    if (setIsOpen) setIsOpen(false);
  };

  const navItems = [
    { to: "/alumnilayout/dashboard", icon: <FaHome />, label: "Dashboard" },
    { to: "/alumnilayout/managementorship", icon: <FaChalkboardTeacher />, label: "Manage Mentorship" },
    { to: "/alumnilayout/testimonials", icon: <FaRegCommentDots />, label: "Testimonials" },
    { to: "/alumnilayout/donations", icon: <FaCalendarCheck />, label: "Donations" },
    { to: "/alumnilayout/feedback", icon: <MdFeedback />, label: "Feedback" },
    { to: "/alumnilayout/mentorshipchatlayout", icon: <BiCommentDetail />, label: "Mentorship Chat" },
    { to: "/alumnilayout/alumniprofile", icon: <FaUserGraduate />, label: "My Profile" },
  ];

  return (
    <>
      {/* =========================
          ⭐ RESPONSIVE SIDEBAR
      ========================== */}
      <motion.aside
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          w-64 h-full 
          bg-gradient-to-b from-green-800 via-green-700 to-green-900
          text-white flex flex-col shadow-2xl border-r border-green-600

          fixed top-0 left-0 z-50 
          lg:static lg:translate-x-0

          overflow-y-auto 
          scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent

          max-h-screen
        "
      >
        {/* Title */}
        <div className="
          p-5 text-center font-extrabold text-3xl tracking-wide 
          bg-green-900/40 border-b border-green-600
          sticky top-0 z-10
        ">
          <span className="bg-gradient-to-r from-lime-400 to-green-300 bg-clip-text text-transparent">
            Synapsis
          </span>{" "}
          Alumni
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 p-5 space-y-2">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                 ${
                   isActive
                     ? "bg-green-500/30 text-white border border-green-400 shadow-inner"
                     : "hover:bg-green-700/40 text-gray-100"
                 }`
              }
            >
              <div className="text-lg group-hover:scale-110 transition">
                {icon}
              </div>
              <span className="text-sm sm:text-base">{label}</span>
            </NavLink>
          ))}
        </nav>
      </motion.aside>

      {/* ==========================
         CLICK OUTSIDE TO CLOSE (Mobile)
      ========================== */}
      {setIsOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-40"
          onClick={handleClose}
        />
      )}
    </>
  );
};

export default AlumniSidebar;

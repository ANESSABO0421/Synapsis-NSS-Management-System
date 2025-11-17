import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoMdCheckmarkCircle } from "react-icons/io";
import {
  FaUser,
  FaCalendarCheck,
  FaAward,
  FaHome,
  FaClock,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { BiComment } from "react-icons/bi";
import { BsMegaphoneFill } from "react-icons/bs";
import { MdRecentActors } from "react-icons/md";

const StudentSidebar = ({ setIsOpen }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (setIsOpen) setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { to: "/studentlayout/dashboard", icon: <FaHome />, label: "Dashboard" },
    {
      to: "/studentlayout/studentevents",
      icon: <FaCalendarCheck />,
      label: "My Events",
    },
    {
      to: "/studentlayout/certificates",
      icon: <FaAward />,
      label: "Certificates",
    },
    // { to: "/student/hours", icon: <FaClock />, label: "Service Hours" },
    {
      to: "/studentlayout/studentattendance",
      icon: <IoMdCheckmarkCircle />,
      label: "View Attendance",
    },
    {
      to: "/studentlayout/announcement",
      icon: <BsMegaphoneFill />,
      label: "Announcement",
    },
    { to: "/studentlayout/chatstudent", icon: <BiComment />, label: "Chat" },
    { to: "/studentlayout/mentorshiprequestbyvolunteer", icon: <MdRecentActors />, label: "Mentorship Request" },
    { to: "/studentlayout/studentprofile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <motion.aside
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 h-screen bg-gradient-to-b from-green-800 via-green-700 to-green-900 text-white flex flex-col shadow-2xl backdrop-blur-md border-r border-green-600"
    >
      {/* Logo / Title */}
      <div className="p-5 text-center font-extrabold text-3xl tracking-wide bg-green-900/40 border-b border-green-600">
        <span className="bg-gradient-to-r from-lime-400 to-green-300 bg-clip-text text-transparent">
          Synapsis
        </span>
        <span className="text-white"> Student</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-5 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/60 scrollbar-track-transparent">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-green-500/30 text-white shadow-inner border border-green-400"
                  : "hover:bg-green-700/40 text-gray-100"
              }`
            }
          >
            <div className="text-lg group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
            <span className="font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default StudentSidebar;

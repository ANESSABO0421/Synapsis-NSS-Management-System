import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaRegCommentDots,
  FaAward,
  FaCalendarCheck,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";

const AlumniSidebar = ({ setIsOpen }) => {
  const navigate = useNavigate();

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
    // { to: "/alumni/achievements", icon: <FaAward />, label: "Achievements" },
    {
      to: "/alumnilayout/testimonials",
      icon: <FaRegCommentDots />,
      label: "Testimonials",
    },
    { to: "/alumnilayout/donations", icon: <FaCalendarCheck />, label: "Donations" },
    { to: "/alumnilayout/alumniprofile", icon: <FaUserGraduate />, label: "My Profile" },
  ];

  return (
    <motion.aside
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 h-screen bg-gradient-to-b from-green-800 via-green-700 to-green-900 text-white flex flex-col shadow-2xl border-r border-green-600 fixed lg:static top-0 left-0 z-50"
    >
      {/* Title */}
      <div className="p-5 text-center font-extrabold text-3xl tracking-wide bg-green-900/40 border-b border-green-600">
        <span className="bg-gradient-to-r from-lime-400 to-green-300 bg-clip-text text-transparent">
          Synapsis
        </span>{" "}
        Alumni
      </div>

      {/* Navigation */}
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
            <div className="text-lg transition-transform duration-200 group-hover:scale-110">
              {icon}
            </div>
            <span className="font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

    </motion.aside>
  );
};

export default AlumniSidebar;

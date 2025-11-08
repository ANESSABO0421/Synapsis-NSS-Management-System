import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCalendarCheck,
  FaAward,
  FaHome,
  FaClock,
  FaHeadset,
} from "react-icons/fa";

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
    { to: "/studentlayout", icon: <FaHome />, label: "Dashboard" },
    { to: "/studentlayout/studentevents", icon: <FaCalendarCheck />, label: "My Events" },
    { to: "/student/certificates", icon: <FaAward />, label: "Certificates" },
    { to: "/student/hours", icon: <FaClock />, label: "Service Hours" },
    { to: "/studentlayout/studentprofile", icon: <FaUser />, label: "Profile" },
    { to: "/student/support", icon: <FaHeadset />, label: "Support" },
  ];

  return (
    <aside className="w-64 h-full bg-green-700 text-white flex flex-col shadow-lg">
      {/* Logo / Title */}
      <div className="p-5 text-center font-bold text-2xl border-b border-green-600">
        Synapsis Student
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleClose}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive
                  ? "bg-green-500 text-white shadow-md"
                  : "hover:bg-green-600 text-gray-100"
              }`
            }
          >
            {icon}
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default StudentSidebar;

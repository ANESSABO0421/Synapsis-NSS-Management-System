import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserCheck,
  FaFilePdf,
  FaAward,
  FaClipboardList,
} from "react-icons/fa";
import { MdEvent, MdLogout } from "react-icons/md";

const TeacherSidebar = ({ setIsOpen }) => {
  const location = useLocation();

  const links = [
    {
      path: "/teacherLayout",
      label: "Dashboard",
      icon: <FaChalkboardTeacher />,
    },
    {
      path: "/teacherLayout/events",
      label: "My Events",
      icon: <MdEvent />,
    },
    {
      path: "/teacherLayout/attendance",
      label: "Attendance",
      icon: <FaUserCheck />,
    },
    {
      path: "/teacherLayout/attendance-pdf",
      label: "Generate Attendance PDF",
      icon: <FaFilePdf />,
    },
    {
      path: "/teacherLayout/grace-marks",
      label: "Assign Grace Marks",
      icon: <FaAward />,
    },
    {
      path: "/teacherLayout/approve-grace",
      label: "Approve Grace Marks",
      icon: <FaClipboardList />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  return (
    <div className="h-full w-64 bg-gradient-to-b from-green-700 to-emerald-600 text-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="text-center font-bold text-xl py-5 border-b border-green-500">
        Synapsis Teacher
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              location.pathname === link.path
                ? "bg-white/20 shadow-inner"
                : "hover:bg-white/10"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-green-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl transition-all"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default TeacherSidebar;

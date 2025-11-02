import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChalkboardTeacher, FaUserCheck, FaFilePdf } from "react-icons/fa";
import { MdAssignmentTurnedIn } from "react-icons/md";

const TeacherSidebar = ({ setIsOpen }) => {
  const location = useLocation();

  const links = [
    { path: "/teacherLayout", label: "Dashboard", icon: <FaChalkboardTeacher /> },
    { path: "/teacherLayout/attendance", label: "Attendance", icon: <FaUserCheck /> },
    { path: "/teacherLayout/gracemarks", label: "Grace Marks", icon: <MdAssignmentTurnedIn /> },
    { path: "/teacherLayout/reports", label: "Reports", icon: <FaFilePdf /> },
  ];

  return (
    <div className="h-full w-64 bg-gradient-to-b from-green-700 to-emerald-600 text-white flex flex-col">
      <div className="text-center font-bold text-xl py-5 border-b border-green-500">
        Synapsis Teacher
      </div>

      <nav className="flex-1 p-4 space-y-2">
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
    </div>
  );
};

export default TeacherSidebar;

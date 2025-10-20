import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { BiLayout, BiMenuAltLeft, BiX } from "react-icons/bi";
import { FaUsers, FaCertificate, FaCalendarAlt } from "react-icons/fa";
import { RiUserStarFill } from "react-icons/ri";

const CoordinatorSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/coordinatorlayout", icon: <BiLayout size={18} /> },
    { name: "Manage Events", path: "/coordinatorlayout/manageevents", icon: <FaCalendarAlt size={18} /> },
    { name: "Volunteers", path: "/coordinatorlayout/volunteers", icon: <FaUsers size={18} /> },
    { name: "Generate Certificates", path: "/coordinatorlayout/certificates", icon: <FaCertificate size={18} /> },
    { name: "Profile", path: "/coordinatorlayout/profile", icon: <RiUserStarFill size={18} /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow flex justify-between items-center p-4">
        <h1 className="text-lg font-bold text-green-700">Coordinator Panel</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-green-700 focus:outline-none"
        >
          {isOpen ? <BiX size={28} /> : <BiMenuAltLeft size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 w-64 bg-white shadow-md p-5 h-screen transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h1 className="hidden md:block text-xl font-bold text-green-700 mb-8">
          Coordinator Panel
        </h1>
        <nav>
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end
              onClick={() => setIsOpen(false)} // Auto-close on mobile link click
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Background overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default CoordinatorSidebar;

"use client";

import React, { useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import { logout } from "@/utils/auth";

import { toast } from "react-toastify";
import { BiMenuAltLeft, BiX } from "react-icons/bi";
import StudentSidebar from "../../components/students/StudentSidebar";

const StudentLayout = ({ children }) => {
  const { ready } = useAuthGuard(["student", "volunteer"]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  if (!ready) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <StudentSidebar setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger menu */}
            <button
              className="md:hidden text-green-700 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <BiX size={28} /> : <BiMenuAltLeft size={28} />}
            </button>
            <h2 className="text-lg font-semibold text-green-700">
              Student Dashboard
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm bg-green-600 hover:bg-green-700 transition-all rounded-2xl px-4 py-2 text-white font-medium"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

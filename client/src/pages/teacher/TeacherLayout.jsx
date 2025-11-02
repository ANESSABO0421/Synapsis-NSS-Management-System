import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import { BiMenuAltLeft, BiX } from "react-icons/bi";

const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    toast.success("You have been logged out");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (responsive toggle) */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <TeacherSidebar setIsOpen={setIsSidebarOpen} />
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
            {/* Hamburger (mobile) */}
            <button
              className="md:hidden text-green-700 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <BiX size={28} /> : <BiMenuAltLeft size={28} />}
            </button>
            <h2 className="text-lg font-semibold text-green-700">
              Teacher Dashboard
            </h2>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-sm bg-green-600 hover:bg-green-700 transition-all rounded-2xl px-4 py-2 text-white font-medium"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;

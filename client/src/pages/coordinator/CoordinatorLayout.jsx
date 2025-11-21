import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import CoordinatorSidebar from "../../components/coordinator/CoordinatorSidebar";
import { BiMenuAltLeft, BiX } from "react-icons/bi";

const CoordinatorLayout = () => {
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Wrapper */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform 
          transition-transform duration-300 ease-in-out 
          w-[250px] md:w-[260px]
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
      >
        <CoordinatorSidebar setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Overlay (mobile only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 border-b">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              className="md:hidden text-green-700 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <BiX size={30} /> : <BiMenuAltLeft size={30} />}
            </button>

            <h2 className="text-lg md:text-xl font-semibold text-green-700 tracking-wide">
              Coordinator Dashboard
            </h2>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-sm md:text-base bg-green-600 hover:bg-green-700 
              transition-all rounded-xl px-4 py-2 text-white font-medium"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoordinatorLayout;

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { BiMenu, BiX } from "react-icons/bi";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Logout = () => {
    localStorage.removeItem("token");
    toast.success("You have been logged out");
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ===== Desktop Sidebar (visible on large screens) ===== */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ===== Mobile Sidebar Overlay ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ===== Mobile Sidebar (drawer) ===== */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-out lg:hidden`}
      >
        {/* Close button inside sidebar */}
        <div className="flex justify-end p-4">
          <BiX
            size={28}
            className="cursor-pointer text-gray-600"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        <Sidebar />
      </div>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ===== Header ===== */}
        <header className="bg-white shadow p-4 flex justify-between items-center">

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-3xl text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <BiMenu />
          </button>

          <h2 className="font-semibold text-gray-700 text-xl">
            Admin Dashboard
          </h2>

          <button
            className="text-sm bg-green-600 rounded-2xl cursor-pointer p-3 text-white font-medium"
            onClick={Logout}
          >
            Logout
          </button>
        </header>

        {/* ===== Page Content ===== */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

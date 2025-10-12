import React from "react";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const Logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Admin Dashboard</h2>
          <button
            className="text-sm bg-green-600 rounded-2xl cursor-pointer p-3 text-white font-medium"
            onClick={() => Logout()}
          >
            Logout
          </button>
        </header>

        {/* content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

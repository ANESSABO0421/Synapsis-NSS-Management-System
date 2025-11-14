import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AlumniSidebar from "../../components/alumni/AlumniSidebar";
import { FaBars } from "react-icons/fa";

const AlumniLayout = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const Logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Sidebar (Desktop + Mobile Animated) */}
      <div className="hidden lg:block">
        <AlumniSidebar />
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)}>
          <AlumniSidebar setIsOpen={setIsOpen} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-green-700 text-2xl mr-3"
            onClick={() => setIsOpen(true)}
          >
            <FaBars />
          </button>

          <h2 className="font-bold text-xl text-green-800 tracking-wide">
            Alumni Dashboard
          </h2>

          <button
            className="text-sm bg-green-700 hover:bg-green-800 transition rounded-xl cursor-pointer py-2 px-4 text-white font-medium"
            onClick={Logout}
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AlumniLayout;

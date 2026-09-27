"use client";

import React, { useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import { logout } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AlumniSidebar from "../../components/alumni/AlumniSidebar";
import { FaBars } from "react-icons/fa";

const AlumniLayout = ({ children }) => {
  const { ready } = useAuthGuard(["alumni"]);
  const navigate = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const Logout = () => {
    logout();
  };

  if (!ready) return null;

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
          {children}
        </main>
      </div>
    </div>
  );
};

export default AlumniLayout;

import React from "react";
import { Outlet } from "react-router-dom";
import AlumniMentorshipList from "./AlumniMentorshipList";

const AlumniMentorshipLayout = () => {
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-100 to-gray-300">

      {/* LEFT – Chat List Sidebar */}
      <div className="
        w-1/3 
        border-r 
        bg-white/70 
        backdrop-blur-xl 
        shadow-[4px_0_20px_rgba(0,0,0,0.08)] 
        overflow-y-auto 
        transition-all 
        duration-300
      ">
        <AlumniMentorshipList />
      </div>

      {/* RIGHT – Chat Window */}
      <div className="
        flex-1 
        bg-gradient-to-br from-white to-gray-100 
        shadow-inner 
        rounded-l-3xl 
        overflow-hidden 
        border-l border-white/40
      ">
        <Outlet />
      </div>

    </div>
  );
};

export default AlumniMentorshipLayout;

import React from "react";
import { Outlet } from "react-router-dom";
import AlumniMentorshipList from "./AlumniMentorshipList";

const AlumniMentorshipLayout = () => {
  return (
    <div className="h-screen flex bg-gray-100">

      {/* LEFT – Chat List Sidebar */}
      <div className="w-1/3 border-r bg-white shadow-xl overflow-y-auto">
        <AlumniMentorshipList />
      </div>

      {/* RIGHT – Chat Window */}
      <div className="flex-1 bg-gray-50 shadow-inner">
        <Outlet />
      </div>

    </div>
  );
};

export default AlumniMentorshipLayout;

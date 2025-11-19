import React from "react";
import { Outlet } from "react-router-dom";
import StudentMentorshipList from "./StudentMentorshipList";

const StudentMentorshipLayout = () => {
  return (
    <div className="h-screen flex bg-gray-100">
      {/* LEFT – Chat List */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        <StudentMentorshipList />
      </div>

      {/* RIGHT – Chat Window */}
      <div className="flex-1 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentMentorshipLayout;

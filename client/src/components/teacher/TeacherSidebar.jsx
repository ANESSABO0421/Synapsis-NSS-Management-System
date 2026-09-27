"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/utils/auth";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaUserCheck,
  FaFilePdf,
  FaAward,
  FaClipboardList,
  FaComment,
  FaUser,
} from "react-icons/fa";
import { MdEvent, MdLogout } from "react-icons/md";
import { Megaphone } from "lucide-react";
import { BsMegaphone, BsMegaphoneFill } from "react-icons/bs";

const TeacherSidebar = ({ setIsOpen }) => {
  const pathname = usePathname();

  const links = [
    {
      path: "/teacherLayout",
      label: "Dashboard",
      icon: <FaChalkboardTeacher />,
    },
    {
      path: "/teacherLayout/myeventsteacher",
      label: "My Events",
      icon: <MdEvent />,
    },
    {
      path: "/teacherLayout/attendanceByTeacher",
      label: "Attendance",
      icon: <FaUserCheck />,
    },
    {
      path: "/teacherLayout/attendancepdf",
      label: "Generate Attendance PDF",
      icon: <FaFilePdf />,
    },
    {
      path: "/teacherLayout/assigngracemarks",
      label: "Assign Grace Marks",
      icon: <FaAward />,
    },
    {
      path: "/teacherLayout/announcement",
      label: "Announcement",
      icon: <BsMegaphoneFill />,
    },
    {
      path: "/teacherLayout/approvegracebyteacher",
      label: "Approve Grace Marks",
      icon: <FaClipboardList />,
    },
    {
      path: "/teacherLayout/teacherchat",
      label: "Chat",
      icon: <FaComment />,
    },
    {
      path: "/teacherLayout/teacherprofile",
      label: "Profile",
      icon: <FaUser />,
    },
  ];

  const handleLogout = () => {
    logout({ delay: 0 });
  };

  return (
    <div className="h-full w-64 bg-gradient-to-b from-green-700 to-emerald-600 text-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="text-center font-bold text-xl py-5 border-b border-green-500">
        Synapsis Teacher
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pathname === link.path
                ? "bg-white/20 shadow-inner"
                : "hover:bg-white/10"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TeacherSidebar;

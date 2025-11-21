import React from "react";
import { BiComment, BiCommentAdd, BiCommentDots, BiLayout, BiTask, BiUser } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { PiChalkboardTeacher, PiChalkboardTeacherBold, PiChalkboardTeacherDuotone, PiGraduationCap, PiStudent, PiStudentDuotone,PiUserBold } from "react-icons/pi";
import { FaSchool } from 'react-icons/fa';
import { RiUser2Fill } from "react-icons/ri";
import { FaGoogleScholar, FaSchoolCircleExclamation } from 'react-icons/fa6';
const Sidebar = () => {
  const navLinks = [
    { name: "Dashboard", path: "/adminpanel", icon: <BiLayout size={18} /> },
    {
      name: "Pending Students",
      path: "/adminpanel/pendingstudent",
      icon: <PiStudent size={18} />,
    },
    {
      name: "Pending Teacher",
      path: "/adminpanel/pendingteacher",
      icon: <PiChalkboardTeacher size={18} />,
    },
    {
      name: "Pending Coordinators",
      path: "/adminpanel/pendingcoordinator",
      icon: <RiUser2Fill size={18} />,
    },
    {
      name: "Pending Alumni",
      path: "/adminpanel/pendingalumni",
      icon: <FaGoogleScholar size={18} />,
    },
    {
      name: "All Student",
      path: "/adminpanel/allstudent",
      icon: <PiStudentDuotone size={18} />,
    },
    {
      name: "All Teachers",
      path: "/adminpanel/allteachers",
      icon: <PiChalkboardTeacherBold size={18} />,
    },
    {
      name: "All Coordinators",
      path: "/adminpanel/allcoordinators",
      icon: <PiUserBold size={18} />,
    },
    {
      name: "All Alumni",
      path: "/adminpanel/allalumni",
      icon: <PiGraduationCap size={18} />,
    },
    {
      name: "Manage Testimonials",
      path: "/adminpanel/testimonials",
      icon: <BiCommentAdd size={18} />,
    },
    {
      name: "Create Institution",
      path: "/adminpanel/createinstitution",
      icon: <FaSchool size={18} />,
    },
    {
      name: "Manage Institute",
      path: "/adminpanel/manageinstitute",
      icon: <FaSchoolCircleExclamation size={18} />,
    },
    {
      name: "Profile",
      path: "/adminpanel/adminprofile",
      icon: <BiUser size={18} />,
    },
  ];
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md p-5 flex-shrink-0 h-screen">
        <h1 className="text-xl font-bold text-green-700 mb-8">Admin Panel</h1>
        <nav>
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end
              className={({ isActive }) => `
            flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
              isActive
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;

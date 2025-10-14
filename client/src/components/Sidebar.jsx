import React from "react";
import { BiLayout, BiTask } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { PiStudent } from "react-icons/pi";

const Sidebar = () => {
  const navLinks = [
    { name: "Dashboard", path: "/adminpanel", icon: <BiLayout size={18} /> },
    
    {name:"Pending Students",path:"/adminpanel/pendingstudent",icon:<PiStudent size={18}/>}
  ];
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md p-5 flex-shrink-0 h-full">
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

import React from "react";
import { BiMenu } from "react-icons/bi";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div>
      {" "}
      <nav
        className="w-full fixed top-0 left-0 bg-gradient-to-r from-green-600 via-blue-600 to-teal-600
 px-6 py-4 lg:px-12 flex justify-between items-center shadow-lg z-50"
      >
        {/* Logo */}
        <div className="text-white flex items-center justify-center gap-2 text-lg md:text-3xl font-extrabold tracking-wide">
          <img
            src="/Synapsis-Logo-bgRemover.png"
            alt="Logo.png"
            className="h-[30px]"
          />
          Synapsis
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex gap-8 text-white text-lg font-semibold">
          <li className="cursor-pointer hover:text-yellow-300 transition">
            Home
          </li>
          <li className="cursor-pointer hover:text-yellow-300 transition">
            About
          </li>
          <li className="cursor-pointer hover:text-yellow-300 transition">
            Features
          </li>
          <li className="cursor-pointer hover:text-yellow-300 transition">
            Events
          </li>
          <li className="cursor-pointer hover:text-yellow-300 transition">
            Contact
          </li>
        </ul>

        {/* login and signup */}
        <div className="hidden md:flex gap-4">
          <button className="px-4 py-2 border border-white text-white rounded-full hover:bg-white hover:text-black transition font-medium shadow-sm">
            <Link>Login</Link>
          </button>
          <button className="px-4 py-2 bg-green-400 font-semibold rounded-full text-white  transition shadow-md">
            <Link>Signup</Link>
          </button>
        </div>

        <div className="md:hidden text-white text-3xl cursor-pointer">
          <BiMenu />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

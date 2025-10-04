import React, { useState } from "react";
import { BiMenu, BiX } from "react-icons/bi";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-50">
      <nav
        className="w-full fixed top-0 left-0 flex justify-between items-center
        px-6 md:px-16 py-4
        bg-gradient-to-r from-green-500 via-green-400 to-teal-300
        backdrop-blur-lg shadow-lg border-b border-green-400/30"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 text-white font-extrabold text-xl md:text-3xl tracking-wide">
          <img
            src="/Synapsis-Logo-bgRemover.png"
            alt="Logo"
            className="h-[34px] animate-pulse"
          />
          <span className="bg-gradient-to-r from-green-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            SYNAPSIS
          </span>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex gap-8 text-white font-semibold text-lg">
          {["Home", "About", "Features", "Events", "Contact"].map((item) => (
            <li
              key={item}
              className="relative group cursor-pointer hover:text-yellow-300 transition"
            >
              {item}
              {/* Animated Underline on Hover */}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-green-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
            </li>
          ))}
        </ul>

        {/* Login/Signup Buttons */}
        <div className="hidden md:flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 border border-white text-white rounded-full
              hover:bg-white hover:text-black transition font-medium shadow-sm"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400
              font-semibold rounded-full text-white transition shadow-md"
          >
            Signup
          </Link>
        </div>

        {/* Mobile Icon */}
        <div
          className="md:hidden text-white text-3xl cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? <BiX /> : <BiMenu />}
        </div>
      </nav>

      {/* Mobile Dropdown */}
      <div
        className={`absolute top-[70px] left-0 w-full bg-gradient-to-br
        from-green-500 via-green-300 to-teal-300/80 backdrop-blur-lg border-t border-green-400/30
        text-white flex flex-col items-center gap-8 py-6 transition-all
        duration-500 ease-in-out ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        {["Home", "About", "Features", "Events", "Contact"].map((item) => (
          <Link
            key={item}
            to={`/${item.toLowerCase()}`}
            className="text-xl tracking-wide font-medium hover:text-yellow-300 transition-all"
            onClick={() => setOpen(false)}
          >
            {item}
          </Link>
        ))}
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 border border-white text-white rounded-full
              hover:bg-white hover:text-black font-semibold transition-all shadow-sm"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full
              text-white font-bold transition-all shadow-md"
          >
            Signup
          </Link>
        </div>
      </div>

      {/* Soft Glow/Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[260px] h-[40px]
        bg-green-400/40 blur-2xl rounded-full pointer-events-none"></div>
    </div>
  );
};

export default Navbar;

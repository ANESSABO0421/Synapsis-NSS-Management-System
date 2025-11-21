import React, { useState, useEffect } from "react";
import { BiMenu, BiX, BiChevronDown } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const roles = ["Student", "Teacher", "Coordinator", "Alumni"];

  /* Track scroll for blur effect */
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Smooth scroll logic */
  const smoothScroll = (e, href) => {
    e.preventDefault();
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[999]">

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`flex justify-between items-center px-6 sm:px-12 lg:px-16 py-4 
        transition-all duration-500 border-b border-white/10
        ${
          scrollY > 20
            ? "backdrop-blur-5xl bg-green-500  shadow-xl"
            : "bg-green-700"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <img
            src="/Synapsis-Logo-bgRemover.png"
            className="h-10 sm:h-12 drop-shadow-lg"
          />
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-green-200 via-cyan-200 to-blue-200">
            SYNAPSIS
          </h1>
        </div>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex items-center gap-8 lg:gap-10 text-white font-medium text-lg">
          {navItems.map((item, i) => (
            <li key={i} className="relative group">
              <a
                href={item.href}
                onClick={(e) => smoothScroll(e, item.href)}
                className="hover:text-green-200 transition"
              >
                {item.label}
              </a>
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-green-300 to-blue-300 group-hover:w-full transition-all duration-300"></span>
            </li>
          ))}
        </ul>

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center gap-4 relative">

          {/* LOGIN */}
          <a
            href="/login"
            className="px-5 py-2 rounded-full border border-white/80 text-white font-semibold hover:bg-white hover:text-gray-900 shadow transition-all duration-300"
          >
            Login
          </a>

          {/* SIGNUP DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setSignupOpen(true)}
            onMouseLeave={() => setSignupOpen(false)}
          >
            <button className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 to-teal-400 text-white font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-lg">
              Signup <BiChevronDown className="text-xl" />
            </button>

            <AnimatePresence>
              {signupOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 mt-3 bg-white rounded-xl shadow-2xl w-48 overflow-hidden"
                >
                  {roles.map((role) => (
                    <a
                      key={role}
                      href={`/signup/${role.toLowerCase()}`}
                      className="block px-4 py-2 hover:bg-green-100 transition"
                    >
                      {role}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden text-white text-3xl" onClick={() => setOpen(!open)}>
          {open ? <BiX /> : <BiMenu />}
        </div>
      </motion.nav>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[75px] w-full left-0 bg-gradient-to-br from-green-700/95 via-teal-600/95 to-blue-700/95 backdrop-blur-xl shadow-xl text-white flex flex-col items-center py-6 gap-6"
          >
            {/* MOBILE NAVLINKS */}
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => smoothScroll(e, item.href)}
                className="text-xl font-medium hover:text-green-200 transition"
              >
                {item.label}
              </a>
            ))}

            {/* LOGIN */}
            <a
              href="/login"
              className="px-6 py-2 rounded-full border border-white/80 text-white hover:bg-white hover:text-gray-900 transition"
              onClick={() => setOpen(false)}
            >
              Login
            </a>

            {/* SIGNUP LIST */}
            <div className="flex flex-col items-center gap-3 mt-3">
              <p className="text-lg font-semibold text-green-200">Signup as</p>

              {roles.map((role) => (
                <a
                  key={role}
                  href={`/signup/${role.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 w-40 text-center rounded-full bg-gradient-to-r from-green-400 to-teal-400 hover:opacity-90 font-semibold"
                >
                  {role}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Navbar;

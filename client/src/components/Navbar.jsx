import React, { useState, useEffect } from "react";
import { BiMenu, BiX, BiChevronDown } from "react-icons/bi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const roles = ["Student", "Teacher", "Coordinator", "Alumni"];

  // Scroll detection for blur effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Link motion variants
  const linkMotion = {
    hidden: { opacity: 0, y: -20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
    }),
  };

  const dropdownMotion = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const mobileMotion = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="relative z-50">
      {/* Navbar container */}
      <motion.nav
        className={`fixed top-0 left-0 w-full flex justify-between items-center px-5 sm:px-10 lg:px-16 py-4 transition-all duration-500 border-b border-white/10 ${
          scrollY > 20
            ? "backdrop-blur-2xl bg-gradient-to-r from-green-700/90 via-teal-600/90 to-blue-700/90 shadow-xl"
            : "bg-gradient-to-r from-green-600 via-teal-500 to-blue-600"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 text-white font-extrabold text-xl sm:text-2xl"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img
            src="/Synapsis-Logo-bgRemover.png"
            alt="Synapsis Logo"
            className="h-10 sm:h-12 object-contain drop-shadow-lg"
            onError={(e) =>
              (e.target.src = "https://via.placeholder.com/40?text=Logo")
            }
          />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300">
            SYNAPSIS
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-8 lg:gap-10 text-white font-medium text-base lg:text-lg">
          {["Home", "About", "Features", "Events", "Contact"].map(
            (item, index) => (
              <motion.li
                key={item}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={linkMotion}
                className="relative group"
              >
                <Link
                  to={`/${item.toLowerCase()}`}
                  className="hover:text-green-200 transition-colors duration-300"
                >
                  {item}
                </Link>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-green-300 to-teal-300 group-hover:w-full transition-all duration-300"></span>
              </motion.li>
            )
          )}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3 relative">
          <Link
            to="/login"
            className="px-5 py-2 border border-white/80 text-white rounded-full hover:bg-white hover:text-gray-900 font-medium transition-all duration-300 shadow-md"
          >
            Login
          </Link>

          {/* Signup dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSignupOpen(true)}
            onMouseLeave={() => setSignupOpen(false)}
          >
            <button className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-green-400 to-teal-400 text-white font-semibold rounded-full hover:from-green-500 hover:to-teal-500 transition-all duration-300 shadow-md">
              Signup <BiChevronDown className="text-lg" />
            </button>

            <AnimatePresence>
              {signupOpen && (
                <motion.div
                  className="absolute right-0 mt-3 w-44 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden origin-top-right"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownMotion}
                >
                  {roles.map((role) => (
                    <Link
                      key={role}
                      to={`/signup/${role.toLowerCase()}`}
                      className="block px-4 py-2 hover:bg-green-100 transition-all duration-200"
                    >
                      {role}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Icon */}
        <motion.div
          className="md:hidden text-white text-3xl cursor-pointer"
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {open ? <BiX /> : <BiMenu />}
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-[72px] left-0 w-full bg-gradient-to-br from-green-700/95 via-teal-600/95 to-blue-700/95 backdrop-blur-xl border-t border-green-400/20 text-white flex flex-col items-center gap-6 py-8 shadow-lg"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMotion}
          >
            {["Home", "About", "Features", "Events", "Contact"].map(
              (item, index) => (
                <motion.div
                  key={item}
                  custom={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-lg font-medium hover:text-green-200 transition-all duration-300"
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              )
            )}

            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="px-6 py-2 border border-white/80 text-white rounded-full hover:bg-white hover:text-gray-900 font-medium transition-all duration-300"
            >
              Login
            </Link>

            <div className="flex flex-col gap-2 mt-3">
              <p className="text-lg font-semibold text-green-100">Signup as</p>
              {roles.map((role) => (
                <Link
                  key={role}
                  to={`/signup/${role.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 text-white font-semibold rounded-full hover:from-green-500 hover:to-teal-500 transition-all duration-300"
                >
                  {role}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-12 bg-green-400/30 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

export default Navbar;

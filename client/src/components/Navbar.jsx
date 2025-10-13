import React, { useState } from "react";
import { BiMenu, BiX, BiChevronDown } from "react-icons/bi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const roles = ["Student", "Teacher", "Coordinator", "Alumni"];

  const linkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.1 },
    }),
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      height: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <div className="relative z-50">
      <nav className="w-full fixed top-0 left-0 flex justify-between items-center px-4 sm:px-8 lg:px-16 py-4 bg-gradient-to-r from-green-600 via-teal-500 to-blue-600 backdrop-blur-xl shadow-lg border-b border-green-500/20">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 text-white font-extrabold text-xl sm:text-2xl lg:text-3xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/Synapsis-Logo-bgRemover.png"
            alt="Synapsis Logo"
            className="h-10 sm:h-12 object-contain"
            onError={(e) =>
              (e.target.src = "https://via.placeholder.com/40?text=Logo")
            }
          />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300">
            SYNAPSIS
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-6 lg:gap-10 text-white font-medium text-base lg:text-lg">
          {["Home", "About", "Features", "Events", "Contact"].map(
            (item, index) => (
              <motion.li
                key={item}
                className="relative group cursor-pointer"
                custom={index}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
              >
                <Link
                  to={`/${item.toLowerCase()}`}
                  className="hover:text-yellow-200 transition-colors duration-300"
                >
                  {item}
                </Link>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-green-300 to-teal-300 group-hover:w-full transition-all duration-300"></span>
              </motion.li>
            )
          )}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-3 relative">
          {/* Simple Login Button */}
          <Link
            to="/login"
            className="px-5 py-2 border border-white/80 text-white rounded-full hover:bg-white hover:text-gray-900 font-medium transition-all duration-300 shadow-sm"
          >
            Login
          </Link>

          {/* Signup Dropdown */}
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
                  className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                >
                  {roles.map((role) => (
                    <Link
                      key={role}
                      to={`/signup/${role.toLowerCase()}`}
                      className="block px-4 py-2 hover:bg-green-100 transition"
                    >
                      {role}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <motion.div
          className="md:hidden text-white text-3xl cursor-pointer"
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {open ? <BiX /> : <BiMenu />}
        </motion.div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-[68px] left-0 w-full bg-gradient-to-br from-green-600/95 via-teal-500/95 to-blue-600/95 backdrop-blur-xl border-t border-green-500/30 text-white flex flex-col items-center gap-6 py-8"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
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
                    className="text-lg font-medium hover:text-yellow-200 transition"
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              )
            )}

            {/* Mobile Login Button */}
            <Link
              to="/login/admin"
              onClick={() => setOpen(false)}
              className="px-6 py-2 border border-white/80 text-white rounded-full hover:bg-white hover:text-gray-900 font-medium transition-all duration-300"
            >
              Login
            </Link>

            {/* Mobile Signup Dropdown */}
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-lg font-semibold">Signup as</p>
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

      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-12 bg-green-400/30 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

export default Navbar;

import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative bg-gray-50 text-gray-900 overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

      <section
        id="Home"
        className="relative z-10 pt-[10vh] flex flex-col items-center justify-center h-screen text-center px-6"
      >
        {/* Heading */}
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-4"
        >
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-teal-600">
            Synapsis
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-2xl text-gray-600 mb-6"
        >
          NSS Management Portal for Students, Teachers, Alumni & Volunteers
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="text-gray-600 max-w-2xl mb-8 text-sm md:text-base leading-relaxed"
        >
          Track your volunteer hours, manage and join events, connect with
          alumni, and make your impact count — all in one powerful platform.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="flex space-x-4"
        >
          <a
            href="#signup"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="px-6 py-3 border border-blue-500 text-black font-semibold rounded-full duration-200 ease-out hover:-translate-y-1 hover:bg-gradient-to-r from-green-500  to-blue-500 transition"
          >
            Explore Features
          </a>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Hero;

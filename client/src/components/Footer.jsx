import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BiLogoFacebook,
  BiLogoTwitter,
  BiLogoLinkedin,
  BiLogoInstagram,
  BiArrowToTop,
} from "react-icons/bi";

const socials = [
  { icon: <BiLogoFacebook />, href: "https://facebook.com" },
  { icon: <BiLogoTwitter />, href: "https://twitter.com" },
  { icon: <BiLogoLinkedin />, href: "https://linkedin.com" },
  { icon: <BiLogoInstagram />, href: "https://instagram.com" },
];

const sitemap = [
  { name: "Home", link: "/" },
  { name: "About", link: "/about" },
  { name: "Features", link: "/features" },
  { name: "Events", link: "/events" },
  { name: "Contact", link: "/contact" },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#001f1f] via-[#002a24] to-[#00423b] text-white py-16 px-6 sm:px-12 border-t border-white/10">
      {/* Floating gradient glows */}
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-green-400/20 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-teal-400/20 blur-[120px] rounded-full"
      />

      {/* Content grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/Synapsis-Logo-bgRemover.png"
              alt="Synapsis Logo"
              className="h-10 w-10 object-contain drop-shadow-md"
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/40?text=Logo")
              }
            />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-teal-200 to-cyan-300 tracking-wide">
              SYNAPSIS
            </span>
          </div>
          <p className="text-sm text-gray-300 mt-2 max-w-xs leading-relaxed">
            Empowering NSS volunteers with seamless event management, progress
            tracking, and collaboration that drives real change.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-green-200 mb-4 text-lg">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {sitemap.map((item, i) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={item.link}
                  className="text-gray-300 hover:text-green-300 transition-all duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-teal-400 group-hover:w-3/4 transition-all duration-300"></span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="font-semibold text-green-200 mb-4 text-lg">Follow Us</h4>
          <div className="flex gap-5 text-2xl">
            {socials.map((soc, idx) => (
              <motion.a
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                whileHover={{ scale: 1.3, color: "#86efac" }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
              >
                {soc.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Back to top */}
        <div className="flex flex-col justify-end items-start lg:items-end">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-green-200 transition-all duration-300 px-4 py-2 rounded-full border border-white/10 hover:border-green-300/40 backdrop-blur-md"
          >
            <BiArrowToTop className="text-lg" />
            Back to top
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="my-10 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      {/* Footer bottom */}
      <div className="text-center text-xs text-gray-400 tracking-wide">
        &copy; {new Date().getFullYear()} SYNAPSIS NSS Management Portal — Built
        with purpose, powered by volunteers 🌿
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BiLogoFacebook, BiLogoTwitter, BiLogoLinkedin, BiLogoInstagram, BiArrowToTop } from "react-icons/bi";

// Animated link variants
const linkVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: "easeOut" }
  }),
};

const socials = [
  { icon: <BiLogoFacebook />, href: "https://facebook.com" },
  { icon: <BiLogoTwitter />, href: "https://twitter.com" },
  { icon: <BiLogoLinkedin />, href: "https://linkedin.com" },
  { icon: <BiLogoInstagram />, href: "https://instagram.com" },
];

const sitemap = [
  { name: "Home", link: "/home" },
  { name: "About", link: "/about" },
  { name: "Features", link: "/features" },
  { name: "Events", link: "/events" },
  { name: "Contact", link: "/contact" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle subscription logic (e.g. fetch/axios)
    setEmail("");
  };

  // Scroll-to-top
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-gradient-to-tr from-teal-700 via-green-700 to-blue-800 border-t border-teal-300/30 pt-12 pb-5 px-4 sm:px-10 mt-16 overflow-hidden z-40">
      {/* Animated glowing stripe */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-80 bg-green-400/20 blur-3xl rounded-full pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
        {/* Brand/Desc */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/Synapsis-Logo-bgRemover.png"
              alt="Synapsis Logo"
              className="h-10 w-10 object-contain"
              onError={(e) => (e.target.src = "https://via.placeholder.com/40?text=Logo")}
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-200 via-teal-100 to-blue-200">
              SYNAPSIS
            </span>
          </div>
          <p className="text-teal-100/70 mt-2 text-sm">A modern platform for hassle-free NSS management, attendance and event tracking.</p>
        </div>

        {/* Sitemap links with animation */}
        <ul className="flex flex-col gap-2 mt-5 sm:mt-0">
          <span className="font-semibold text-white/90 mb-3">Sitemap</span>
          {sitemap.map((item, i) => (
            <motion.li
              key={item.name}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={linkVariants}
              className="overflow-hidden"
            >
              <Link
                to={item.link}
                className="text-teal-50/90 hover:text-yellow-200 transition-all duration-300 relative"
              >
                {item.name}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-green-300 to-blue-200 group-hover:w-4/5 transition-all duration-300"></span>
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-white/90 mb-3">Newsletter</span>
          <p className="text-teal-100/70 text-sm">Get the latest updates about features and NSS events delivered to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mt-1">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email"
              autoComplete="off"
              className="rounded-full px-4 py-2 text-sm text-teal-900 bg-white focus:outline-none shadow focus:shadow-xl w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 text-white font-semibold rounded-full shadow transition-all duration-300 hover:from-green-500 hover:to-teal-500"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Socials + Scroll to Top */}
        <div className="flex flex-col gap-4 items-start">
          <span className="font-semibold text-white/90 mb-3">Connect</span>
          <div className="flex gap-4 text-2xl text-white">
            {socials.map((soc, idx) => (
              <motion.a
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                whileHover={{ scale: 1.2, color: "#FFD700" }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
              >
                {soc.icon}
              </motion.a>
            ))}
          </div>
          <button
            onClick={scrollToTop}
            className="mt-3 flex items-center gap-1 text-sm text-teal-100/80 hover:text-yellow-200 group transition-all duration-300 pl-2 pr-4 py-2 rounded-full border border-teal-100/40"
            aria-label="Scroll to top"
          >
            <BiArrowToTop className="text-xl group-hover:rotate-12 transition-transform duration-300" />
            To top
          </button>
        </div>
      </div>

      {/* Lower copyright */}
      <div className="mt-10 text-sm text-center text-teal-100/50">
        &copy; {new Date().getFullYear()} SYNAPSIS NSS Management System. Crafted with passion. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

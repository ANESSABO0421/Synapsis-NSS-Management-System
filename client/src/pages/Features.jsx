import React from "react";
import { useEffect } from "react";
import {
  FaUsers,
  FaCalendarCheck,
  FaChartLine,
  FaHandshake,
} from "react-icons/fa";
import gsap from "gsap";
import ScrollTrigger from "gsap/all";

const featuresData = [
  {
    icon: <FaUsers />,
    title: "Volunteer Management",
    desc: "Register, track, and manage volunteers with ease while building strong NSS teams.",
    color: "from-green-400 to-teal-300",
    glow: "shadow-[0_0_30px_0_rgba(16,185,129,0.20)]",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Event Tracking",
    desc: "Organize and join events, monitor participation, and keep everyone informed.",
    color: "from-cyan-400 to-green-300",
    glow: "shadow-[0_0_30px_0_rgba(6,182,212,0.20)]",
  },
  {
    icon: <FaChartLine />,
    title: "Performance Insights",
    desc: "Gain insights into volunteer hours, activities, and overall impact in real time.",
    color: "from-blue-400 to-green-200",
    glow: "shadow-[0_0_30px_0_rgba(59,130,246,0.22)]",
  },
  {
    icon: <FaHandshake />,
    title: "Alumni Connect",
    desc: "Build a bridge between students, alumni, and mentors to strengthen NSS connections.",
    color: "from-teal-400 to-blue-300",
    glow: "shadow-[0_0_30px_0_rgba(45,212,191,0.20)]",
  },
];

const Features = () => {
  useEffect(() => {
    gsap.fromTo(
      "#features",
      { y: -200, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration:1}
    );
  }, []);

  return (
    <section
      id="features"
      className="w-full bg-white py-16 px-3 md:px-6 lg:px-16"
    >
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 drop-shadow">
          Key Features of <span className="text-green-600">Synapsis</span>
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Synapsis helps NSS volunteers, teachers, and alumni connect
          seamlessly, making it easy to track contributions, organize events,
          and celebrate impact.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10">
        {featuresData.map((f, i) => (
          <div
            key={f.title}
            className={`relative group transition-all duration-400
              bg-white/70 backdrop-blur-[5px] bg-clip-padding
              border border-green-200 rounded-3xl px-6 py-7
              shadow-xl ${f.glow}
              hover:bg-gradient-to-br ${f.color} hover:bg-opacity-90
              hover:scale-[1.04] hover:shadow-2xl cursor-pointer
              flex flex-col items-center min-h-[260px] md:min-h-[220px]`}
            style={{
              boxShadow: "0 6px 24px 0px rgba(52,211,153,0.10)",
            }}
          >
            {/* Abstract Gradient Glow */}
            <span
              className={`absolute inset-0 z-0 rounded-3xl blur-2xl opacity-0 group-hover:opacity-50 pointer-events-none bg-gradient-to-br ${f.color}`}
            ></span>
            {/* Icon */}
            <div
              className={`z-10 relative mb-5 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/70 border-4 border-white shadow-md group-hover:bg-white/90 transition-all text-3xl md:text-4xl text-green-700`}
            >
              {f.icon}
            </div>
            {/* Title */}
            <h3 className="z-10 relative text-lg md:text-xl text-gray-800 font-bold mb-3 group-hover:text-white text-center transition-all">
              {f.title}
            </h3>
            {/* Description */}
            <p className="z-10 relative text-gray-600 group-hover:text-white/90 text-sm md:text-md text-center transition-all min-h-[44px] md:min-h-[64px] px-1">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

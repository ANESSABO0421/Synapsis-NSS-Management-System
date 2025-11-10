import React, { useEffect, useRef } from "react";
import { FaUsers, FaCalendarCheck, FaChartLine, FaHandshake } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const featuresData = [
  {
    icon: <FaUsers />,
    title: "Volunteer Management",
    desc: "Register, track, and manage volunteers efficiently while building strong NSS teams.",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Event Tracking",
    desc: "Organize and monitor events effortlessly while keeping everyone in sync.",
  },
  {
    icon: <FaChartLine />,
    title: "Performance Insights",
    desc: "Get real-time insights into volunteer hours, participation, and overall impact.",
  },
  {
    icon: <FaHandshake />,
    title: "Alumni Connect",
    desc: "Bridge students, alumni, and mentors to strengthen the NSS network.",
  },
];

const Features = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;

    // Section fade-in
    gsap.fromTo(
      section,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      }
    );

    // Cards slide-up + stagger
    gsap.fromTo(
      cardsRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative w-full bg-white py-28 px-8 sm:px-16 lg:px-24 overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="inline-block border-l-4 border-green-600 pl-4 mb-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 tracking-tight">
            Key <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Features</span>
          </h2>
        </div>
        <p className="text-green-700 max-w-2xl mx-auto text-base md:text-lg">
          Experience a smarter way to manage NSS — built for collaboration, insight, and impact.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
        {featuresData.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => (cardsRef.current[i] = el)}
            className="group relative bg-white border border-green-200 rounded-3xl p-8 shadow-[0_10px_40px_rgba(34,197,94,0.1)] hover:shadow-[0_15px_60px_rgba(34,197,94,0.2)] transition-all duration-500 hover:-translate-y-2"
          >
            {/* Accent border glow */}
            <span className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-green-400/50 transition-all duration-300 pointer-events-none"></span>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="text-5xl mb-5 text-green-600 group-hover:text-green-700 transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3 group-hover:text-green-900 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-green-700 text-sm leading-relaxed group-hover:text-green-800 transition-colors duration-300">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

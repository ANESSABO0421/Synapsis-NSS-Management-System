import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const listItemsRef = useRef([]);

  useEffect(() => {
    const el = sectionRef.current;
    const img = imageRef.current;
    const text = textRef.current;

    // Section fade-in
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        },
      }
    );

    // Text slide-in
    gsap.fromTo(
      text,
      { x: -80, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: text,
          start: "top 80%",
        },
      }
    );

    // Image scale-in
    gsap.fromTo(
      img,
      { scale: 0.9, opacity: 0, rotate: 3 },
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: img,
          start: "top 85%",
        },
      }
    );

    // Bullet points stagger animation
    gsap.fromTo(
      listItemsRef.current,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: text,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center py-28 px-8 sm:px-16 lg:px-24 bg-white"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* Left Side — Text */}
        <div ref={textRef} className="space-y-8">
          <div className="border-l-4 border-green-600 pl-6">
            <h2 className="text-5xl md:text-6xl font-extrabold text-green-800 tracking-tight leading-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
                Synapsis
              </span>
            </h2>
          </div>

          <p className="text-green-700 text-lg leading-relaxed max-w-xl">
            <span className="font-semibold text-green-800">Synapsis</span> is a
            modern NSS Management Portal designed for{" "}
            <span className="font-semibold">students, teachers, alumni,</span>{" "}
            and <span className="font-semibold">volunteers</span>. It empowers
            users to manage events, track volunteer hours, and connect with
            others — fostering a culture of contribution and social impact.
          </p>

          <ul className="space-y-5 text-green-700 text-lg">
            {[
              "Easily track and record volunteer hours",
              "Get notified about new NSS events",
              "Collaborate with alumni and mentors",
              "Visualize achievements and progress",
            ].map((item, i) => (
              <li
                key={i}
                ref={(el) => (listItemsRef.current[i] = el)}
                className="flex items-center gap-3 group"
              >
                <span className="w-2 h-2 rounded-full bg-green-600 group-hover:scale-125 transition-transform duration-300"></span>
                <span className="group-hover:text-green-800 transition-colors duration-300">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side — Image */}
        <div ref={imageRef} className="relative flex justify-center">
          <div className="relative overflow-hidden rounded-3xl border border-green-200 shadow-[0_10px_40px_rgba(34,197,94,0.15)] hover:shadow-[0_15px_60px_rgba(34,197,94,0.25)] transition-all duration-500">
            <img
              src="/Synapsis-Logo.png"
              alt="About Synapsis"
              className="w-[420px] h-[420px] md:w-[460px] md:h-[460px] object-contain transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

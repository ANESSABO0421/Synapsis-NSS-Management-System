import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
  const [data, setData] = useState([]);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  const getAllTestimonial = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alumni/testimonials/top");
      setData(res.data.testimonials);
      console.log(res.data)
    } catch (error) {
      console.log("error fetching data:", error);
    }
  };

  useEffect(() => {
    getAllTestimonial();
  }, []);

  useEffect(() => {
    if (!data.length) return;

    // Fade in section
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      }
    );

    // Title animation
    gsap.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        },
      }
    );

    // Cards animation
    gsap.fromTo(
      cardsRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      }
    );

    // 3D hover effect on each card
    cardsRef.current.forEach((card) => {
      if (!card) return;
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(card, {
          rotationY: x / 25,
          rotationX: -y / 25,
          transformPerspective: 600,
          ease: "power2.out",
          duration: 0.3,
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: "power3.out",
          duration: 0.5,
        });
      });
    });
  }, [data]);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-8 bg-gradient-to-br from-green-50 via-white to-cyan-50 overflow-hidden"
    >
      {/* Glowing Background Orbs */}
      <div className="absolute top-[-8rem] left-[-8rem] w-[22rem] h-[22rem] bg-green-300/30 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-8rem] right-[-8rem] w-[24rem] h-[24rem] bg-teal-300/25 rounded-full blur-[130px]"></div>

      {/* Header */}
      <div ref={titleRef} className="text-center mb-20 relative z-10">
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          Voices That{" "}
          <span className="bg-gradient-to-r from-green-600 via-teal-500 to-blue-500 bg-clip-text text-transparent">
            Inspire
          </span>
        </h2>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          Reflections from those who turned service into legacy — every word a ripple of impact.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl w-full">
        {data.map((t, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            className="relative bg-white/70 backdrop-blur-xl border border-green-100 rounded-3xl p-8 shadow-lg hover:shadow-green-300/50 
              transition-all duration-500 group overflow-hidden hover:-translate-y-2"
          >
            {/* Gradient Hover Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-green-200/40 to-teal-200/30 blur-xl rounded-3xl"></div>

            {/* Profile Section */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
                <img
                  src={t.profileImage || "/default-avatar.png"}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {t.name}
              </h3>
              <p className="text-green-600 text-sm font-medium">
                {t.department} • {t.graduationYear}
              </p>
            </div>

            {/* Message */}
            <p className="relative z-10 mt-6 text-gray-700 italic text-center leading-relaxed">
              “{t.message}”
            </p>

            {/* Quote Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-6 left-6 w-10 h-10 text-green-300/30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.17 6A4.003 4.003 0 003 10v5a3 3 0 006 0v-5h-1v5a2 2 0 01-4 0v-5a3 3 0 014-3v1zm10 0a4.003 4.003 0 00-4 4v5a3 3 0 006 0v-5h-1v5a2 2 0 01-4 0v-5a3 3 0 014-3v1z" />
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;

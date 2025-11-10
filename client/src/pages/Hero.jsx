import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const Hero = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  const bgImages = [
    "/Images/IMG2.png",
    "/Images/IMG3.png",
    "/Images/IMG4.png",
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial fade-in animation for section content
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
      });

      // Text & button stagger animation
      gsap.from([titleRef.current, textRef.current, buttonsRef.current], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
        delay: 0.5,
      });

      // Floating blob animations (looping)
      gsap.to(blob1Ref.current, {
        y: -30,
        scale: 1.1,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(blob2Ref.current, {
        y: 40,
        rotate: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background Swiper */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {bgImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`bg-${i}`}
                className="w-full h-full object-cover brightness-75"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-green-900/40 to-black/60 mix-blend-overlay"></div>
      </div>

      {/* Floating Animated Blobs */}
      <div
        ref={blob1Ref}
        className="absolute top-10 left-10 w-72 h-72 bg-green-500/30 blur-3xl rounded-full mix-blend-screen"
      ></div>

      <div
        ref={blob2Ref}
        className="absolute bottom-10 right-16 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen"
      ></div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-8 md:px-16 text-white max-w-5xl">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-300 to-blue-400 animate-gradient-x">
            Synapsis
          </span>
        </h1>

        <p
          ref={textRef}
          className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8"
        >
          Your all-in-one NSS Management Platform — empowering students,
          teachers, alumni, and volunteers to create meaningful social impact.
        </p>

        {/* Buttons */}
        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-500 rounded-full font-semibold shadow-lg hover:scale-105 hover:shadow-2xl hover:from-green-700 hover:to-blue-600 transition-all duration-300">
            Get Started
          </button>

          <button className="px-8 py-4 border-2 border-green-400/70 rounded-full font-semibold text-green-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-teal-500 hover:text-white transition-all duration-300 shadow-md">
            Explore Features
          </button>
        </div>
      </div>

      {/* Subtle Glass Overlay */}
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[2px] bg-white/5"></div>
    </section>
  );
};

export default Hero;

import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const Hero = () => {
  const bgImages = [
    "/Images/IMG2.png",
    "/Images/IMG3.png",
    "/Images/IMG4.png"
  ]; 

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative text-gray-900 overflow-hidden min-h-screen flex items-center justify-center"
    >
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {bgImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`background-${i}`}
                className="w-full h-full object-cover opacity-70"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Optional dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="absolute top-0 left-0 w-80 h-80 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-70 z-5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-70 z-5"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-2xl animate-pulse opacity-50 z-5"></div>

      <section
        id="Home"
        className="relative z-10 pt-[12vh] flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 lg:px-8"
      >
        {/* Heading */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-5 tracking-tight text-white drop-shadow-lg"
        >
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-teal-400">
            Synapsis
          </span>
        </motion.h1>

        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-6 font-medium max-w-3xl drop-shadow"
        >
          NSS Management Portal for Students, Teachers, Alumni & Volunteers
        </motion.h2>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="text-gray-200 max-w-2xl mb-10 text-sm sm:text-base lg:text-lg leading-relaxed px-4 drop-shadow"
        >
          Seamlessly track volunteer hours, manage events, connect with alumni,
          and amplify your impact with our intuitive platform.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <a
            href="#signup"
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="px-8 py-4 border-2 border-blue-400 text-blue-200 font-semibold rounded-full hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:text-white transition-all duration-300"
          >
            Explore Features
          </a>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Hero;

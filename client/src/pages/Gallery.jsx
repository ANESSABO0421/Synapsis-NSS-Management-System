import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Gallery = () => {
  const [images, setImages] = useState([]);
  const cardsRef = useRef([]);
  const navigate = useNavigate();

  const getImages = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/events/getalleventimage"
      );
      if (res.data.success) {
        // Limit to 4 images only
        setImages(res.data.images.slice(0, 4));
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    if (!images.length) return;

    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    gsap.to(cardsRef.current, {
      scrollTrigger: {
        trigger: "#gallery",
        start: "top 85%",
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15,
    });

    // 3D tilt effect on hover
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
          duration: 0.4,
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: "power3.out",
          duration: 0.6,
        });
      });
    });
  }, [images]);

  return (
    <section
      id="gallery"
      className="relative py-20 px-6 md:px-12 bg-white overflow-hidden"
    >
      {/* Background glow accents */}

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          The Spirit of{" "}
          <span className="bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
            Togetherness
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Capturing moments of unity, compassion, and social impact through the
          NSS journey.
        </p>
      </div>

      {/* Gallery Grid — 2 Columns × 2 Rows */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {images.length === 0 ? (
          <p className="text-gray-400 text-xl col-span-full text-center">
            No images available yet.
          </p>
        ) : (
          images.map((img, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="relative group bg-white/70 backdrop-blur-xl border border-green-200 rounded-3xl overflow-hidden 
                shadow-lg hover:shadow-green-300/40 hover:-translate-y-2 transition-all duration-500"
            >
              {/* Subtle gradient glow */}
              <span className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-200/20 via-transparent to-cyan-100/10 opacity-0 group-hover:opacity-100 transition duration-500"></span>

              {/* Image */}
              <img
                src={img.url}
                alt={img.caption || `Gallery image ${i + 1}`}
                loading="lazy"
                className="w-full h-72 object-cover object-center rounded-3xl group-hover:scale-105 transition-transform duration-500"
              />

              {/* Overlay gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"></div>

              {/* Caption area */}
              <div className="absolute bottom-0 w-full px-5 py-4 bg-white/80 backdrop-blur-xl border-t border-green-100 rounded-b-3xl text-center">
                {img.eventTitle && (
                  <h3 className="text-lg font-semibold text-green-700 truncate">
                    {img.eventTitle}
                  </h3>
                )}
                {img.caption && (
                  <p className="text-gray-600 text-sm mt-1">{img.caption}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex items-center justify-center">
        <button className="p-5 bg-[#008236] mt-[50px] rounded-2xl text-white hover:bg-green-600 transition-all ease-out duration-300 hover:-translate-y-2 shadow-2xl" onClick={()=>navigate("/eventalbum")}>
          View All Images
        </button>
      </div>
    </section>
  );
};

export default Gallery;

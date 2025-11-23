import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const AlumniGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/alumni/allinstituteimages",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setImages(res.data.images || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle Modal Navigation
  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-full h-48 bg-gray-300 animate-pulse rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  // Empty
  if (!images.length) {
    return (
      <div className="h-[60vh] flex items-center justify-center flex-col text-gray-600">
        <p className="text-lg font-medium">No images found for your institution.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl md:text-2xl font-semibold mb-5 text-gray-800">
        📸 Alumni Event Gallery
      </h2>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="relative overflow-hidden rounded-xl shadow-md group cursor-pointer"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={img.url}
              alt={`gallery-img-${index}`}
              className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110"
            />
          </motion.div>
        ))}
      </div>

      {/* Modal Viewer */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 text-white p-2 bg-black/40 rounded-full hover:bg-black"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={28} />
            </button>

            {/* Left Arrow */}
            <button
              className="absolute left-5 text-white p-2 bg-black/40 rounded-full hover:bg-black"
              onClick={prevImage}
            >
              <ChevronLeft size={32} />
            </button>

            {/* Image */}
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex].url}
              className="max-w-[90%] max-h-[80%] rounded-xl shadow-lg select-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            />

            {/* Right Arrow */}
            <button
              className="absolute right-5 text-white p-2 bg-black/40 rounded-full hover:bg-black"
              onClick={nextImage}
            >
              <ChevronRight size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlumniGallery;

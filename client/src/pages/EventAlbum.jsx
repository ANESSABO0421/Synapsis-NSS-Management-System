import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const EventAlbum = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/events/getalleventimage"
        );
        setImages(res.data.images);
      } catch (err) {
        console.log(err);
      }
    };
    fetchImages();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 px-8 py-14">
        <h1 className="text-5xl font-extrabold tracking-tight text-center mb-16 text-gray-900 drop-shadow-sm">
          NSS Premium Event Gallery ✨
        </h1>

        {/* Premium Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 space-y-7 gap-7">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              className="relative group rounded-3xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-xl break-inside-avoid cursor-pointer"
              onClick={() => setSelectedImage(img)} // CLICK TO OPEN LIGHTBOX
            >
              {/* Premium Image */}
              <motion.img
                src={img.url}
                alt="event"
                className="w-full h-auto rounded-3xl object-cover"
                whileHover={{ scale: 1.12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* Overlay */}
              <div
                className="
                absolute inset-0 
                bg-gradient-to-t 
                from-black/80 via-black/50 to-transparent
                opacity-0 group-hover:opacity-100 
                transition-all duration-500
                flex flex-col justify-end 
                p-5 rounded-3xl
              "
              >
                <p className="text-white text-xl font-semibold mb-1 drop-shadow-lg">
                  {img.eventTitle}
                </p>
                <p className="text-gray-300 text-sm drop-shadow-md">
                  {new Date(img.eventDate).toDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX VIEWER */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[1000]"
            onClick={() => setSelectedImage(null)} // CLICK TO CLOSE
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={selectedImage.url}
              alt="zoomed"
              className="max-w-4xl w-full rounded-2xl shadow-2xl"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventAlbum;

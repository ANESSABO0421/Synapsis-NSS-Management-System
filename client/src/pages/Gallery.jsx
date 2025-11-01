import axios from "axios";
import React, { useEffect, useState } from "react";

const Gallery = () => {
  const [images, setImages] = useState([]);

  const getImages = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/events/getalleventimage"
      );
      if (res.data.success) {
        setImages(res.data.images.slice(0,3));
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  return (
    <div className="p-8 flex flex-col items-center bg-gradient-to-br from-green-50 to-cyan-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 drop-shadow">
          The Spirit of <span className="text-green-600">Togetherness</span>
        </h2>
        <p className="text-gray-700 mt-4 max-w-2xl mx-auto text-lg">
          Showcasing stories of service, compassion, and collective progress.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full max-w-6xl">
        {images.length === 0 ? (
          <p className="text-gray-400 text-xl col-span-full text-center transition-all">
            No images available yet.
          </p>
        ) : (
          images.map((img, indx) => (
            <div
              key={indx}
              className="relative overflow-hidden rounded-3xl group border border-green-200
                bg-white/80 backdrop-blur-xl shadow-2xl shadow-green-100/[0.15]
                transition-all duration-400 hover:shadow-green-400/30"
            >
              {/* Colored floating glow in the background */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <span className="absolute -bottom-4 -left-8 w-36 h-20 bg-green-300/30 blur-2xl rounded-full"></span>
                <span className="absolute top-2 right-0 w-24 h-14 bg-cyan-200/30 blur-xl rounded-full"></span>
              </div>
              {/* Image with zoom animation on hover */}
              <img
                src={img.url}
                alt={img.caption || `Event image ${indx + 1}`}
                className="w-full h-64 object-cover object-center rounded-2xl z-10 relative
                  group-hover:scale-105 group-hover:brightness-110 transition-all duration-500"
                loading="lazy"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 
                bg-gradient-to-t from-green-500/50 to-transparent transition-all duration-400"
              />
              {/* Caption */}
              <div className="relative z-30 px-4 py-3 bg-white/75 backdrop-blur-2xl border-t border-green-100
                text-center rounded-b-2xl">
                {img.eventTitle && (
                  <p className="font-bold text-green-700 text-base tracking-wide truncate">
                    {img.eventTitle}
                  </p>
                )}
                {img.caption && (
                  <p className="text-gray-600 text-xs mt-0.5">{img.caption}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;

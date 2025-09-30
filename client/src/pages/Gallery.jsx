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
        setImages(res.data.images);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          The Spirit of <span className="text-green-600">Togetherness</span>
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Showcasing stories of service, compassion, and collective progress.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {images.length === 0 ? (
          <p className="text-gray-500 text-lg col-span-full text-center">
            No images available yet.
          </p>
        ) : (
          images.map((img, indx) => (
            <div
              key={indx}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img
                src={img.url}
                alt={img.caption || `Event image ${indx + 1}`}
                className="w-full h-56 object-cover"
              />
              <div className="p-3 text-center bg-gray-50">
                {img.eventTitle && (
                  <p className="font-semibold text-green-700 text-sm">
                    {img.eventTitle}
                  </p>
                )}
                {img.caption && (
                  <p className="text-gray-600 text-xs mt-1">{img.caption}</p>
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

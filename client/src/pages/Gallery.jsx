import axios from "axios";
import React from "react";
import { useState } from "react";

const Gallery = () => {
    const [image, setImage] = useState([])
    const getImages=async()=>{
        const eventImages=await axios.get("http://localhost:3000")

    }

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
    </div>
  );
};

export default Gallery;

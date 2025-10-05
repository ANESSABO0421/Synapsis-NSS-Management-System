import React, { useEffect, useState } from "react";
import axios from "axios";

const Testimonials = () => {
  const [data, setData] = useState([]);

  const getAllTestimonial = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alumni/top/all");
      setData(res.data.testimonials);
    } catch (error) {
      console.log("error fetching data:", error);
    }
  };

  useEffect(() => {
    getAllTestimonial();
  }, []);

  return (
    <div className="p-10 bg-gradient-to-tr from-green-50 via-white to-yellow-50 min-h-screen flex flex-col items-center">
      {/* Header Section */}
      <div className="max-w-7xl text-center mb-16">
        <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Voices That <span className="text-green-600">Endure</span>
        </h2>
        <p className="mt-4 text-lg text-gray-700 max-w-xl mx-auto font-light">
          Stories that outlast time, from those who once walked these halls.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl w-full px-4">
        {data.map((t, indx) => (
          <div
            key={indx}
            className="relative bg-white rounded-3xl p-8 shadow-[0_20px_30px_rgba(72,187,120,0.25)] hover:shadow-[0_25px_40px_rgba(72,187,120,0.45)] transition-transform duration-500 hover:scale-[1.06] hover:-rotate-1"
          >
            {/* Quotation Mark */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-6 left-6 w-10 h-10 text-green-300 opacity-30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.17 6A4.003 4.003 0 003 10v5a3 3 0 006 0v-5h-1v5a2 2 0 01-4 0v-5a3 3 0 014-3v1zm10 0a4.003 4.003 0 00-4 4v5a3 3 0 006 0v-5h-1v5a2 2 0 01-4 0v-5a3 3 0 014-3v1z" />
            </svg>

            {/* Abstract Blob */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-green-200 rounded-full rotate-12 filter blur-xl opacity-40"></div>

            {/* Profile Image */}
            <div className="relative z-10 w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-green-600 shadow-lg">
              <img
                src={t.profileImage || "/default-avatar.png"}
                alt={`Profile of ${t.name}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Testimonial Content */}
            <h3 className="mt-8 text-xl font-semibold text-gray-900 text-center">
              {t.name}
            </h3>
            <p className="text-center text-green-600 font-medium text-sm">
              {t.department} | {t.graduationYear}
            </p>
            <p className="mt-4 text-gray-700 italic text-base text-center leading-relaxed min-h-[5rem]">
              “{t.message}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;

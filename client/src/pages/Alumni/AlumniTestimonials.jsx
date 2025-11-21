import React, { useState } from "react";
import axios from "axios";

const AlumniTestimonials = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return alert("Please write your testimonial.");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/alumni/testimonial",
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);
      setMessage("");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-6 sm:p-10 border border-gray-100">

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
          Share Your Experience ✨
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base px-2">
          Your testimonial helps inspire future students and alumni.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Your Testimonial
            </label>

            <textarea
              className="
                w-full
                h-32 sm:h-40
                p-4
                rounded-xl
                bg-gray-50
                border border-gray-300
                focus:outline-none
                focus:ring-2 focus:ring-green-400
                focus:border-green-400
                transition
                text-gray-800
                shadow-sm
                text-sm sm:text-base
              "
              placeholder="Write about your experience, achievements or journey..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={400}
            ></textarea>

            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {message.length}/400 characters
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-xl text-white text-lg font-semibold shadow-md
              transition-transform transform hover:scale-[1.01]
              ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90"
              }
            `}
          >
            {loading ? "Submitting..." : "Submit Testimonial"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AlumniTestimonials;

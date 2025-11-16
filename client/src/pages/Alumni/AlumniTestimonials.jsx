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
    <div className="p-6 sm:p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-10 border border-gray-100">

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Share Your Experience ✨
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
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
                h-40
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
              "
              placeholder="Write about your experience, achievements or journey..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={400}
            ></textarea>

            <div className="text-right text-sm text-gray-500 mt-1">
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
                  ? "bg-blue-300"
                  : "bg-gradient-to-r from-green-600 to-green-600 hover:opacity-90"
              }
            `}
          >
            {loading ? "Submitting..." : "Submit Testimonial"}
          </button>
        </form>

        {/* Footer */}
        
      </div>
    </div>
  );
};

export default AlumniTestimonials;

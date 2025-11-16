import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch all testimonials
  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alumni/testimonials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTestimonials(res.data.testimonials || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Approve / Reject
  const updateVisibility = async (alumniId, testimonialId, visibility) => {
    try {
      await axios.put(
        `http://localhost:3000/api/alumni/${alumniId}/testimonial/${testimonialId}/visibility`,
        { visibility },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI instantly
      setTestimonials((prev) =>
        prev.map((t) =>
          t.testimonialId === testimonialId ? { ...t, visibility } : t
        )
      );

      alert(`Testimonial ${visibility} successfully`);
    } catch (error) {
      console.error(error);
      alert("Error updating testimonial");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Loading testimonials...</div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Manage Testimonials
      </h1>

      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <p className="text-center text-gray-500">No testimonials found</p>
        ) : (
          testimonials.map((t) => (
            <div
              key={t.testimonialId}
              className="bg-white shadow-lg rounded-2xl border p-6 flex gap-5"
            >
              {/* Profile */}
              <img
                src={t.profileImage || "/default-avatar.png"}
                alt="alumni"
                className="w-20 h-20 rounded-full object-cover border"
              />

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{t.name}</h2>
                <p className="text-gray-600 text-sm">
                  {t.department} • {t.graduationYear}
                </p>

                <p className="mt-3 text-gray-700 leading-relaxed">{t.message}</p>

                <p className="mt-2">
                  Status:{" "}
                  <span
                    className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      t.visibility === "approved"
                        ? "bg-green-100 text-green-700"
                        : t.visibility === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {t.visibility}
                  </span>
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      updateVisibility(t.alumniId, t.testimonialId, "approved")
                    }
                    disabled={t.visibility === "approved"}
                    className={`px-4 py-2 rounded-lg text-white ${
                      t.visibility === "approved"
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateVisibility(t.alumniId, t.testimonialId, "rejected")
                    }
                    disabled={t.visibility === "rejected"}
                    className={`px-4 py-2 rounded-lg text-white ${
                      t.visibility === "rejected"
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageTestimonials;

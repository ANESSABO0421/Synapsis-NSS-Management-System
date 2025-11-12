import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const CoordinatorMyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = "http://localhost:3000/api/coordinator"; // ✅ Backend base URL

  // 🟦 Fetch Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.data;
        console.log(data)
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "",
          institutionName: data.institutionName || "",
          institution: data.institution || "",
        });
        setPreview(data.profileImage || "/default-avatar.png");
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        setMessage("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  // 🟨 Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🖼️ Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🟩 Handle Form Submit (PUT request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      // append updated fields
      form.append("name", formData.name);
      form.append("phone", formData.phone);
      form.append("department", formData.department);
      form.append("institution", formData.institution);
      if (imageFile) form.append("profileImage", imageFile);

      const res = await axios.put(`${API_BASE_URL}/updateProfile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res.data.data;
      setProfile(updated);
      setFormData({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        department: updated.department || "",
        institution: updated.institution || "",
      });
      setPreview(updated.profileImage || "/default-avatar.png");

      setEditMode(false);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Update error:", err);
      setMessage("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile)
    return (
      <div className="text-center text-gray-400 py-10 text-lg font-medium">
        Loading profile...
      </div>
    );

  return (
    <section className="min-h-screen  text-gray-100 flex justify-center items-center px-4 py-12">
      <motion.div
        className="relative w-full max-w-lg bg-[#111111]/90 border border-gray-700 rounded-2xl shadow-[0_0_25px_rgba(0,150,255,0.25)] p-8 backdrop-blur-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-300">
          My Profile
        </h2>

        {/* 🖼️ Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={preview}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-2 border-sky-400 shadow-lg transition-all duration-300 group-hover:scale-105"
            />
            {editMode && (
              <label className="absolute bottom-1 right-1 bg-sky-500 hover:bg-sky-400 text-xs px-2 py-1 rounded-md cursor-pointer">
                Change
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* 📝 Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 rounded-lg bg-[#1b1b1b] border ${
                editMode ? "border-sky-400" : "border-gray-700"
              } focus:outline-none focus:ring-1 focus:ring-sky-500 transition`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-[#1b1b1b] border border-gray-700 text-gray-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 rounded-lg bg-[#1b1b1b] border ${
                editMode ? "border-sky-400" : "border-gray-700"
              } focus:outline-none focus:ring-1 focus:ring-sky-500 transition`}
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 rounded-lg bg-[#1b1b1b] border ${
                editMode ? "border-sky-400" : "border-gray-700"
              } focus:outline-none focus:ring-1 focus:ring-sky-500 transition`}
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Institution
            </label>
            <input
              type="text"
              value={formData.institutionName}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-[#1b1b1b] border border-gray-700 text-gray-400"
            />
          </div>

          {/* 🔘 Buttons */}
          <div className="text-center mt-6">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 transition-all duration-200 font-medium shadow-md"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3 justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-all font-medium shadow-md disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData(profile);
                    setPreview(profile.profileImage || "/default-avatar.png");
                    setImageFile(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-all font-medium shadow-md"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Status Message */}
        {message && (
          <p
            className={`text-center text-sm mt-4 ${
              message.startsWith("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default CoordinatorMyProfile;

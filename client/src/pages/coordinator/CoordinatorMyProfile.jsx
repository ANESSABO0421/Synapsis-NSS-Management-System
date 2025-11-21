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

  const API_BASE_URL = "http://localhost:3000/api/coordinator";

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.data;
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
        console.error("Profile load error:", err);
        setMessage("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

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
      setFormData(updated);
      setPreview(updated.profileImage);

      setEditMode(false);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile)
    return (
      <div className="text-center text-gray-400 py-14 text-lg font-medium">
        Loading profile...
      </div>
    );

  return (
    <section
      className="
        min-h-screen w-full 
        flex justify-center items-center 
        px-4 py-12 
        
      "
    >
      <motion.div
        className="
          w-full max-w-lg 
          bg-white/10 backdrop-blur-xl 
          border border-white/20 
          rounded-3xl shadow-2xl 
          p-8 sm:p-10
        "
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        {/* Title */}
        <h2 className="
          text-3xl sm:text-4xl font-bold 
          text-center mb-8
          text-transparent bg-clip-text 
          bg-gradient-to-r from-green-700 to-green-700
        ">
          My Profile
        </h2>

        {/* Image */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <img
              src={preview}
              alt="Profile"
              className="
                w-28 h-28 sm:w-32 sm:h-32 
                rounded-full object-cover 
                border-2 border-green-400 
                shadow-lg transition-all
                group-hover:scale-105
              "
            />

            {editMode && (
              <label className="
                absolute bottom-1 right-1 
                bg-green-500 hover:bg-green-400
                text-xs px-2 py-1 rounded-md cursor-pointer shadow-md
              ">
                Change
                <input hidden type="file" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <InputField
            label="Name"
            name="name"
            value={formData.name}
            editable={editMode}
            onChange={handleChange}
          />

          {/* Email */}
          <InputField
            label="Email"
            value={formData.email}
            editable={false}
          />

          {/* Phone */}
          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            editable={editMode}
            onChange={handleChange}
          />

          {/* Department */}
          <InputField
            label="Department"
            name="department"
            value={formData.department}
            editable={editMode}
            onChange={handleChange}
          />

          {/* Institution */}
          <InputField
            label="Institution"
            value={formData.institutionName}
            editable={false}
          />

          {/* Buttons */}
          <div className="text-center pt-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                type="button"
                className="
                  px-7 py-2.5 rounded-lg 
                  bg-green-600 hover:bg-green-500 
                  transition shadow-md text-white font-semibold
                "
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3 justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-7 py-2.5 rounded-lg 
                    bg-green-600 hover:bg-green-500 
                    transition shadow-md text-white font-semibold
                    disabled:opacity-50
                  "
                >
                  {loading ? "Updating..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData(profile);
                    setPreview(profile.profileImage);
                    setImageFile(null);
                  }}
                  className="
                    px-7 py-2.5 rounded-lg 
                    bg-gray-600 hover:bg-gray-500 
                    transition shadow-md text-white font-semibold
                  "
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
            className={`
              text-center text-sm mt-5 
              ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}
            `}
          >
            {message}
          </p>
        )}
      </motion.div>
    </section>
  );
};

/* Reusable Input Component */
const InputField = ({ label, editable, name, value, onChange }) => (
  <div>
    <label className="block text-sm text-gray-300 mb-1">{label}</label>
    <input
      name={name}
      value={value}
      disabled={!editable}
      onChange={onChange}
      className={`
        w-full px-3 py-2 rounded-lg 
        bg-black/40 text-gray-200
        border 
        ${editable ? "border-green-400" : "border-green-700"}
        focus:outline-none focus:ring-1 focus:ring-green-400
        transition
      `}
    />
  </div>
);

export default CoordinatorMyProfile;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiUser,
  FiPhone,
  FiBookOpen,
  FiStar,
  FiCamera,
  FiSave,
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    department: "",
    talents: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/students/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.student);
        setFormData({
          name: res.data.student.name || "",
          phoneNumber: res.data.student.phoneNumber || "",
          department: res.data.student.department || "",
          talents: (res.data.student.talents || []).join(", "),
        });
        setImagePreview(res.data.student.profileImage.url || null);
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("department", formData.department);
      data.append(
        "talents",
        formData.talents.split(",").map((t) => t.trim())
      );
      if (imageFile) data.append("profileImage", imageFile);

      const res = await axios.put(
        "http://localhost:3000/api/students/profile/edit",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(res.data.student);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile)
    return (
      <div className="text-center text-green-700 mt-10 text-xl animate-pulse">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-green-200 p-6">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-green-300 p-8 transition-all duration-300 hover:shadow-green-300/40">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-green-700 flex items-center justify-center gap-2 drop-shadow-sm">
          <FaLeaf className="text-green-600 text-3xl" />
          My Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={imagePreview || "/default-avatar.png"}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-4 border-green-500 shadow-md transition-all duration-300 group-hover:scale-105"
              />
              <label className="absolute bottom-2 right-2 bg-green-600 text-white px-3 py-1 text-xs rounded-full cursor-pointer flex items-center gap-1 hover:bg-green-700 shadow-md transition">
                <FiCamera />
                <span>Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1 text-green-800">
                <FiUser /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold mb-1 text-green-800">
                <FiPhone /> Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold mb-1 text-green-800">
                <FiBookOpen /> Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold mb-1 text-green-800">
                <FiStar /> Talents (comma separated)
              </label>
              <input
                type="text"
                name="talents"
                value={formData.talents}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-green-400/50 hover:scale-[1.02] transition-all duration-300"
          >
            <FiSave className="text-xl" />
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;

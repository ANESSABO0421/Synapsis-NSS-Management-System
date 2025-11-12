import React, { useState, useEffect } from "react";
import axios from "axios";

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // ✅ Fetch teacher profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/teacher/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.teacher);
        setFormData(res.data.teacher);
        setImagePreview(res.data.teacher.profileImage?.url || "");
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsChanged(true);
  };

  // ✅ Handle image change (preview + mark changed)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, profileImage: file }));
    setIsChanged(true);
  };

  // ✅ Submit updates
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      // append updated data
      for (const key in formData) {
        form.append(key, formData[key]);
      }

      const res = await axios.put(
        "http://localhost:3000/api/teacher/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(res.data.teacher);
      setFormData(res.data.teacher);
      setImagePreview(res.data.teacher.profileImage?.url || "");
      setIsChanged(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-green-700 font-semibold">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-10">
      <div className="w-full max-w-3xl bg-white border-2 border-green-500 shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Teacher Profile
        </h2>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={imagePreview || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-green-400 shadow-md"
            />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-0 right-0 bg-green-600 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              Change
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              disabled
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              className="w-full p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department || ""}
              onChange={handleChange}
              className="w-full p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            />
          </div>
        </div>

        {/* Save Button */}
        {isChanged && (
          <div className="text-center mt-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProfile;

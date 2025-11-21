import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiSave, FiUser, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // ======== FETCH PROFILE =========
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.admin);
        setFormData({
          name: res.data.admin.name,
          email: res.data.admin.email,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ======== HANDLE INPUT =========
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ======== UPDATE PROFILE =========
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:3000/api/admin/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setProfile(formData);
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-green-600 text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen  py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl border border-green-200">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">
          Admin Profile
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <FiUser /> Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              disabled={!editMode}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border ${
                editMode ? "border-green-400" : "border-gray-200"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <FiMail /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full mt-1 p-2 border border-gray-200 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md"
            >
              <FiEdit2 /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-all shadow-md"
            >
              <FiSave /> Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

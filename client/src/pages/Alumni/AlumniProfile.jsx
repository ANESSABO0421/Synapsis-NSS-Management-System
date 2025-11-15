import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaSchool, FaCamera } from "react-icons/fa";

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState(null);
  const [previewImg, setPreviewImg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alumni/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data.data);
      setPreviewImg(res.data.data?.profileImage?.url || "/default-user.png");
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 📌 Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImg(URL.createObjectURL(file)); // Preview
    }
  };

  // 📌 UPDATE PROFILE WITH IMAGE
  const updateProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("department", profile.department);
      formData.append("graduationYear", profile.graduationYear);

      if (newImage) formData.append("profileImage", newImage);

      await axios.put("http://localhost:3000/api/alumni/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  if (!profile)
    return <p className="text-center mt-10 text-red-500">Profile not found.</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">My Profile</h1>

      <div className="bg-white shadow-lg rounded-xl p-6 border space-y-6">

        {/* Profile Image Section */}
        <div className="flex items-center gap-6 relative">
          <img
            src={previewImg}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-green-600 shadow"
          />

          {editMode && (
            <label className="absolute left-20 bottom-2 bg-white rounded-full p-2 cursor-pointer shadow-md">
              <FaCamera className="text-green-700" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-gray-600">
              {profile.department} • {profile.graduationYear}
            </p>
          </div>
        </div>

        {/* Institution */}
        <div className="flex items-center gap-3 text-gray-700">
          <FaSchool className="text-xl text-green-700" />
          <span className="font-medium">
            Institution: {profile.institution?.name}
          </span>
        </div>

        <hr />

        {/* Editable Form */}
        <div className="space-y-4">
          <div>
            <label className="font-medium">Name</label>
            <input
              name="name"
              disabled={!editMode}
              value={profile.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg mt-1 ${
                !editMode && "bg-gray-100"
              }`}
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              name="email"
              disabled={!editMode}
              value={profile.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg mt-1 ${
                !editMode && "bg-gray-100"
              }`}
            />
          </div>

          <div>
            <label className="font-medium">Department</label>
            <input
              name="department"
              disabled={!editMode}
              value={profile.department}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg mt-1 ${
                !editMode && "bg-gray-100"
              }`}
            />
          </div>

          <div>
            <label className="font-medium">Graduation Year</label>
            <input
              name="graduationYear"
              disabled={!editMode}
              value={profile.graduationYear}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg mt-1 ${
                !editMode && "bg-gray-100"
              }`}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <button
              onClick={updateProfile}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
            >
              <FaSave /> Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;

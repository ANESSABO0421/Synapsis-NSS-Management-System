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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

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
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-0">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">
        My Profile
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 border space-y-6">

        {/* Profile Image Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="relative">
            <img
              src={previewImg}
              alt="Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-green-600 shadow"
            />

            {editMode && (
              <label className="absolute right-0 bottom-0 bg-white rounded-full p-2 cursor-pointer shadow-md">
                <FaCamera className="text-green-700" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold">{profile.name}</h2>
            <p className="text-gray-600 text-sm sm:text-base">{profile.email}</p>
            <p className="text-gray-600 text-sm sm:text-base">
              {profile.department} • {profile.graduationYear}
            </p>
          </div>
        </div>

        {/* Institution */}
        <div className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
          <FaSchool className="text-xl text-green-700" />
          <span className="font-medium">
            Institution: {profile.institution?.name}
          </span>
        </div>

        <hr />

        {/* Editable Form */}
        <div className="space-y-4">
          {["name", "email", "department", "graduationYear"].map((field) => (
            <div key={field}>
              <label className="font-medium capitalize text-gray-700">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                name={field}
                disabled={!editMode}
                value={profile[field]}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg mt-1 text-sm sm:text-base ${
                  !editMode && "bg-gray-100"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 w-full sm:w-auto"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <button
              onClick={updateProfile}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 w-full sm:w-auto"
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

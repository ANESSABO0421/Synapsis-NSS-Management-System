import React, { useState } from "react";
import { API } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function StudentSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    talents: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (profileImage) formData.append("profileImage", profileImage);

      const res = await axios.post("http://localhost:3000/api/students/studentsignup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Signup successful! Please verify OTP.");
      // here the studetId is passed which is inside state but when we move to another page do pass it like params because less secure so use useLocation
      navigate("/verifyotp", { state: { studentId: res.data.studentId } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Signup failed";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          Student Signup
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Create your student account to get started
        </p>

        {message && (
          <p
            className={`text-center mb-4 text-sm ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Upload */}
          <div className="flex flex-col items-center">
            <label
              htmlFor="profileImage"
              className="cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-green-400 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-green-50 transition"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm text-center px-2">
                  Upload Photo
                </span>
              )}
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              name="phoneNumber"
              type="text"
              placeholder="Enter your phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              name="department"
              type="text"
              placeholder="Enter your department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Talents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talents / Skills
            </label>
            <input
              name="talents"
              type="text"
              placeholder="E.g. Singing, Leadership, Sports"
              value={form.talents}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login/admin" className="text-green-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

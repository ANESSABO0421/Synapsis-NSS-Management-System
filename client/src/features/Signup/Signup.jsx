"use client";

import { API_URL } from "@/utils/config";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function StudentSignup() {
  const navigate = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    talents: "",
    password: "",
    institution: "",
  });

  const [institutions, setInstitutions] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/institution/getallinstitutes`
        );
        setInstitutions(res.data.institutions || []);
      } catch (err) {
        toast.error("Failed to fetch institutions");
      }
    };
    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (profileImage) fd.append("profileImage", profileImage);

      const res = await axios.post(
        `${API_URL}/api/students/studentsignup`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Signup successful! Verify OTP.");
      navigate.push(
        `/verifyotp?id=${res.data.userId}&role=${res.data.role}`
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-700 via-emerald-600 to-lime-600 p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">

        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Student Signup
        </h1>
        <p className="text-center text-green-100 mt-2 mb-6">
          Create your account and join the platform
        </p>

        {/* Status Message */}
        {message && (
          <p
            className={`text-center mb-4 text-sm font-semibold ${
              message.includes("successful")
                ? "text-green-300"
                : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Profile Upload */}
          <div className="flex flex-col items-center mb-4">
            <label
              htmlFor="profileImage"
              className="cursor-pointer w-28 h-28 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden shadow-xl hover:scale-105 transition-all flex justify-center items-center"
            >
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <span className="text-white text-sm">Upload Photo</span>
              )}
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-white text-sm mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-white text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-white text-sm mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-white text-sm mb-1">
              Institution
            </label>
            <select
              name="institution"
              value={form.institution}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-green-300 outline-none"
            >
              <option value="" className="text-black">
                Select institution
              </option>

              {institutions.map((inst) => (
                <option
                  key={inst._id}
                  value={inst._id}
                  className="text-black"
                >
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-white text-sm mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              placeholder="Enter your department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Talents */}
          <div>
            <label className="block text-white text-sm mb-1">
              Skills / Talents
            </label>
            <input
              type="text"
              name="talents"
              placeholder="E.g. singing, sports, leadership"
              value={form.talents}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-white mt-6 text-sm">
          Already have an account?{" "}
          <a href="/login/admin" className="text-green-300 underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

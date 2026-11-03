"use client";

import { API_URL } from "@/utils/config";





import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";

const TeacherSignup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    password: "",
    institutionId: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [verifyDocument, setVerifyDocument] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [institutions, setInstitutions] = useState([]);

  const navigate = useRouter();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/institution/getallinstitutes`
        );
        setInstitutions(res.data.institutions);
      } catch (err) {
        toast.error("Failed to load institutions");
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    if (profileImage) formData.append("profileImage", profileImage);
    if (verifyDocument) formData.append("verificationDocument", verifyDocument);

    try {
      const res = await axios.post(
        `${API_URL}/api/teacher/signup`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message);
      navigate.push(
        `/verifyotp?id=${res.data.userId}&role=${res.data.role}`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-green-800 p-4">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10 space-y-6"
      >
        <h2 className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Teacher Registration
        </h2>
        <p className="text-center text-green-100 text-sm">
          Register with your verified institution details
        </p>

        {/* INPUTS */}
        <div className="space-y-4">
          {["name", "email", "phoneNumber", "department", "password"].map(
            (field, index) => (
              <div key={index}>
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  required
                  placeholder={
                    field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/([A-Z])/g, " $1")
                  }
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-green-300 transition"
                />
              </div>
            )
          )}
        </div>

        {/* INSTITUTION */}
        <div>
          <label className="text-sm text-white mb-1 block">
            Select Institution
          </label>
          <select
            name="institutionId"
            required
            value={form.institutionId}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white outline-none focus:ring-2 focus:ring-green-300 transition"
          >
            <option value="" className="text-black">
              -- Select Institution --
            </option>
            {institutions.map((inst) => (
              <option key={inst._id} value={inst._id} className="text-black">
                {inst.name}
              </option>
            ))}
          </select>
        </div>

        {/* PROFILE IMAGE */}
        <div>
          <label className="text-sm text-white block mb-1">
            Profile Image (optional)
          </label>
          <div className="flex items-center gap-4">
            {previewImage ? (
              <img
                src={previewImage}
                className="w-16 h-16 rounded-full border-2 border-green-300 object-cover shadow-lg"
                alt="Preview"
              />
            ) : (
              <div className="w-16 h-16 flex justify-center items-center rounded-full bg-white/20 border border-white/40 text-white shadow-md">
                📷
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="text-white/90 text-sm"
            />
          </div>
        </div>

        {/* DOCUMENT UPLOAD */}
        <div>
          <label className="text-sm text-white block mb-1">
            Upload Verification Document (required)
          </label>
          <input
            type="file"
            required
            accept="image/*,application/pdf"
            onChange={(e) => setVerifyDocument(e.target.files[0])}
            className="w-full text-white/90 text-sm"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 hover:shadow-lg transition-all"
        >
          Sign Up
        </button>

        <p className="text-center text-white text-sm">
          Already registered?{" "}
          <span
            onClick={() => navigate.push("/login")}
            className="text-green-300 cursor-pointer underline"
          >
            Login here
          </span>
        </p>
      </motion.form>
    </div>
  );
};

export default TeacherSignup;

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateInstitution = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const token=localStorage.getItem("token")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/institution/create",
        form,{headers:{Authorization:`Bearer ${token}`}}
      );
      toast.success(res.data.message || "Institution created successfully!");
      setForm({ name: "", address: "", email: "", phone: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create institution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Create Institution
        </h2>

        <label className="block mb-2 font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Enter institution name"
          required
        />

        <label className="block mb-2 font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Enter institution email"
          required
        />

        <label className="block mb-2 font-medium text-gray-700">Phone</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Enter institution phone"
          required
        />

        <label className="block mb-2 font-medium text-gray-700">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-6"
          placeholder="Enter institution address"
          rows="3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-2 rounded-lg"
        >
          {loading ? "Creating..." : "Create Institution"}
        </button>
      </form>
    </div>
  );
};

export default CreateInstitution;

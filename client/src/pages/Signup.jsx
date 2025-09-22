import { useState } from "react";
import { API } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/signup", form);
      setMessage(res.data.message);
      // redirect to OTP page with adminId
      navigate("/verifyotp", { state: { adminId: res.data.adminId } });
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Signup</h2>

        <input
          name="name"
          placeholder="Name"
          className="w-full mb-3 p-2 border rounded"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          className="w-full mb-3 p-2 border rounded"
          value={form.phoneNumber}
          onChange={handleChange}
        />
        <input
          name="department"
          placeholder="Department"
          className="w-full mb-3 p-2 border rounded"
          value={form.department}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={form.password}
          onChange={handleChange}
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Signup
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { API } from "../utils/api";
import { useLocation, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setMessage("✅ Login successful");

      if (user.role === "admin") {
        window.location.href = "/admindashboard";
      } else if (user.role === "student") {
        window.location.href = "/studentdashboard";
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  //error fetching and showing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      setMessage(error);
    }
  }, [location]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 relative">
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Login to your account to continue
        </p>

        {/* Message */}
        {message && (
          <p
            className={`text-center mb-4 text-sm ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600 transition duration-200"
        >
          <FaGoogle />
          Continue with Google
        </button>

        {/* Extra Links */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link to={"/signup"} className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

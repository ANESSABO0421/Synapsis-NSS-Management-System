import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const possibleLogins = [
      { role: "admin", url: "http://localhost:3000/api/admin/login" },
      {
        role: "coordinator",
        url: "http://localhost:3000/api/coordinator/logincoordinator",
      },
      {
        role: "student",
        url: "http://localhost:3000/api/students/studentlogin",
      },
      { role: "teacher", url: "http://localhost:3000/api/teacher/login" },
    ];

    let success = false;

    for (let { role, url } of possibleLogins) {
      try {
        const res = await axios.post(url, form);
        const token = res.data.token;
        const user =
          res.data.admin ||
          res.data.coordinator ||
          res.data.student ||
          res.data.volunteer ||
          res.data.teacher;

        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          localStorage.setItem("email", user.email);

          toast.success(`${role} login successful`);
          success = true;
          setMessage("");

          setTimeout(() => {
            if (role === "admin") window.location.href = "/adminpanel";
            else if (role === "coordinator")
              window.location.href = "/coordinatorlayout";
            else if (role === "teacher")
              window.location.href = "/teacherDashboard";
            else window.location.href = "/studentdashboard";
          }, 1000);

          break; // stop checking others
        }
      } catch (error) {
        // silently continue — don't show message here
        continue;
      }
    }

    if (!success) {
      setMessage("Invalid credentials or account not found");
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) setMessage(error);
  }, [location]);

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL — VIDEO */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden">
        <video
          src="/video/Login.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white space-y-4">
          <h1 className="text-4xl font-extrabold drop-shadow-xl">
            Welcome to <span className="text-lime-300">Synapsis NSS Portal</span>
          </h1>
          <p className="text-gray-200 text-sm max-w-xs">
            “Empowering students to serve with purpose and make a difference.”
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — LOGIN FORM */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gradient-to-br from-white/80 to-emerald-50 backdrop-blur-md relative overflow-hidden">
        {/* background accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-300 rounded-full blur-3xl opacity-30"></div>

        <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl w-[90%] max-w-sm p-8 border border-green-100 transition-all duration-300 hover:scale-[1.02]">
          <h2 className="text-3xl font-extrabold text-center text-green-800 mb-2">
            Welcome Back 👋
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Sign in to continue your journey with <b>Synapsis</b>
          </p>

          {/* Feedback Message */}
          {message && (
            <div
              className={`text-center mb-4 py-2 rounded-xl font-medium text-sm ${
                message.includes("successful")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-green-400 bg-white transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-green-400 bg-white transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-emerald-200 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">
              or
            </span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition duration-300 shadow-sm hover:shadow-md text-sm"
          >
            <FaGoogle className="text-green-500 text-base" />
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link
              to={"/signup"}
              className="text-green-700 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

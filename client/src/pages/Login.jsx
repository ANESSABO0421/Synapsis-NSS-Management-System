import React, { useEffect, useState } from "react";
import { API } from "../utils/api";
import { useLocation } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  //gets the current url
  const location = useLocation();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //handle the submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("token", res.data.token);
      setMessage("Login successful");
      window.location.href = "/dashboard";
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  //login using google button
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  //if user not found using gmail show error
  useEffect(() => {
    // url search params used to get the exact value i mean %20=space like that
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      setMessage(error);
    }
  }, [location]);

  return (
    <div>
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        {message && <p className="mt-3 text-sm">{message}</p>}
        <form
          className="bg-white p-6 rounded-xl shadow-md w-96"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold mb-4">Login</h2>

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded"
          />

          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Login
          </button>
        </form>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-[380px] bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;

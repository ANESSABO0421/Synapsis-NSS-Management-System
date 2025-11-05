import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      // ✅ Save credentials in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // ✅ Wait a bit to ensure localStorage is set
      setTimeout(() => {
        if (role === "admin" || role === "superadmin") {
          navigate("/adminpanel");
        } else if (role === "coordinator") {
          navigate("/coordinatorlayout");
        } else if (role === "teacher") {
          navigate("/teacherlayout");
        } else if (role === "student") {
          navigate("/studentlayout");
        } else {
          navigate("/login?error=invalidrole");
        }
      }, 300); // <-- small delay fixes race conditions
    } else {
      navigate("/login");
    }

    setLoading(false);
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">
      <div className="p-6 bg-white shadow-lg rounded-2xl text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {loading ? "Logging you in..." : "Redirecting..."}
        </h2>
        <p className="text-sm text-gray-500">
          Please wait while we complete your Google authentication.
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;

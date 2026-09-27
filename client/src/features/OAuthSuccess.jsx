"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const OAuthSuccess = () => {
  const navigate = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      // ✅ Save credentials in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      const destinations = {
        admin: "/adminpanel",
        superadmin: "/adminpanel",
        coordinator: "/coordinatorlayout",
        teacher: "/teacherLayout",
        student: "/studentlayout",
        volunteer: "/studentlayout",
        alumni: "/alumnilayout",
      };

      // Full reload, not router.push: SocketProvider reads the token once on mount,
      // so it must re-mount to pick up the token we just stored.
      window.location.href = destinations[role] || "/login?error=invalidrole";
    } else {
      navigate.push("/login");
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

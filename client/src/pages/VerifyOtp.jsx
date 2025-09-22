import { useState } from "react";
import { API } from "../utils/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const adminId = location.state?.adminId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/verify-otp", { adminId, otp });
      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Verify OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full mb-3 p-2 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Verify
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}

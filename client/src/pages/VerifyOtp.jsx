// import axios from "axios";
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const VerifyOtp = () => {
//   // get the data from previous page
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [otp, setOtp] = useState("");
//   const [message, setMessage] = useState("");
//   const studentId = location.state?.studentId;
//   const teacherId = location.state?.teacherId;
//   console.log(studentId);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/teacher/verify-otp",
//         { teacherId, otp }
//       );
//       toast.success(res.data.message);
//       setTimeout(() => {
//         navigate("/login");
//       });
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "OTP verification failed";
//       setMessage(errorMsg);
//       toast.error(errorMsg);
//     }
//   };
//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-6 rounded-xl shadow-md w-96"
//       >
//         <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>

//         <input
//           type="text"
//           placeholder="Enter OTP"
//           className="w-full mb-3 p-2 border rounded text-center"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           required
//         />

//         <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
//           Verify OTP
//         </button>

//         {message && (
//           <p className="mt-3 text-sm text-red-600 text-center">{message}</p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default VerifyOtp;

import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  console.log(location);

  const { teacherId, studentId, coordinatorId, alumniId, role } =
    location.state || {};
  const id = teacherId || studentId || coordinatorId || alumniId;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || !role) {
      toast.error("Missing user ID or role — please sign up again.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/otp/verify-otp", {
        id,
        otp,
        role,
      });

      toast.success(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const errMsg = error.response?.data?.message || "OTP verification failed";
      setMessage(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-green-600">
          Verify OTP ({role})
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full mb-3 p-2 border rounded text-center"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Verify OTP
        </button>

        {message && (
          <p className="mt-3 text-sm text-red-600 text-center">{message}</p>
        )}
      </form>
    </div>
  );
};

export default VerifyOtp;

// import React, { useState } from "react";
// import { API } from "../../utils/api";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import axios from "axios";

// export default function StudentSignup() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phoneNumber: "",
//     department: "",
//     talents: "",
//     password: "",
//   });
//   const [profileImage, setProfileImage] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       Object.entries(form).forEach(([key, value]) =>
//         formData.append(key, value)
//       );
//       if (profileImage) formData.append("profileImage", profileImage);

//       const res = await axios.post("http://localhost:3000/api/students/studentsignup", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success("Signup successful! Please verify OTP.");
//       // here the studetId is passed which is inside state but when we move to another page do pass it like params because less secure so use useLocation
//       navigate("/verifyotp", { state: { studentId: res.data.userId,role:res.data.role } });
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || "Signup failed";
//       setMessage(errorMsg);
//       toast.error(errorMsg);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
//       <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
//         <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
//           Student Signup
//         </h2>
//         <p className="text-center text-gray-500 mb-6 text-sm">
//           Create your student account to get started
//         </p>

//         {message && (
//           <p
//             className={`text-center mb-4 text-sm ${
//               message.includes("successful") ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Profile Upload */}
//           <div className="flex flex-col items-center">
//             <label
//               htmlFor="profileImage"
//               className="cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-green-400 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-green-50 transition"
//             >
//               {preview ? (
//                 <img
//                   src={preview}
//                   alt="Profile Preview"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-gray-400 text-sm text-center px-2">
//                   Upload Photo
//                 </span>
//               )}
//             </label>
//             <input
//               id="profileImage"
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               className="hidden"
//             />
//           </div>

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name
//             </label>
//             <input
//               name="name"
//               type="text"
//               placeholder="Enter your full name"
//               value={form.name}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               name="email"
//               type="email"
//               placeholder="Enter your email"
//               value={form.email}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Phone Number */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Phone Number
//             </label>
//             <input
//               name="phoneNumber"
//               type="text"
//               placeholder="Enter your phone number"
//               value={form.phoneNumber}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Department */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Department
//             </label>
//             <input
//               name="department"
//               type="text"
//               placeholder="Enter your department"
//               value={form.department}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Talents */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Talents / Skills
//             </label>
//             <input
//               name="talents"
//               type="text"
//               placeholder="E.g. Singing, Leadership, Sports"
//               value={form.talents}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               name="password"
//               type="password"
//               placeholder="Create a strong password"
//               value={form.password}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600 transition duration-200"
//           >
//             Sign Up
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           Already have an account?{" "}
//           <a href="/login/admin" className="text-green-500 hover:underline">
//             Login here
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { API } from "../../utils/api";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import axios from "axios";

// export default function StudentSignup() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phoneNumber: "",
//     department: "",
//     talents: "",
//     password: "",
//     institution: "",
//   });
//   const [institutions, setInstitutions] = useState([]);
//   const [profileImage, setProfileImage] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchInstitutions = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:3000/api/institution/getallinstitutes"
//         );
//         setInstitutions(res.data.institutions);
//       } catch (err) {
//         toast.error("Failed to load institutions");
//       }
//     };
//     fetchInstitutions();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       Object.entries(form).forEach(([key, value]) =>
//         formData.append(key, value)
//       );
//       if (profileImage) formData.append("profileImage", profileImage);
//       // console.log("Submitting form data:", Object.fromEntries(formData));

//       const res = await axios.post(
//         "http://localhost:3000/api/students/studentsignup",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       console.log(res.data.institution);
//       toast.success("Signup successful! Please verify OTP.");
//       navigate("/verifyotp", {
//         state: { studentId: res.data.userId, role: res.data.role },
//       });
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || "Signup failed";
//       setMessage(errorMsg);
//       toast.error(errorMsg);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
//       <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
//         <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
//           Student Signup
//         </h2>
//         <p className="text-center text-gray-500 mb-6 text-sm">
//           Create your student account to get started
//         </p>

//         {message && (
//           <p
//             className={`text-center mb-4 text-sm ${
//               message.includes("successful") ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Profile Upload */}
//           <div className="flex flex-col items-center">
//             <label
//               htmlFor="profileImage"
//               className="cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-green-400 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-green-50 transition"
//             >
//               {preview ? (
//                 <img
//                   src={preview}
//                   alt="Profile Preview"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-gray-400 text-sm text-center px-2">
//                   Upload Photo
//                 </span>
//               )}
//             </label>
//             <input
//               id="profileImage"
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               className="hidden"
//             />
//           </div>

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name
//             </label>
//             <input
//               name="name"
//               type="text"
//               placeholder="Enter your full name"
//               value={form.name}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               name="email"
//               type="email"
//               placeholder="Enter your email"
//               value={form.email}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Phone Number */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Phone Number
//             </label>
//             <input
//               name="phoneNumber"
//               type="text"
//               placeholder="Enter your phone number"
//               value={form.phoneNumber}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Institution Dropdown */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Institution
//             </label>
//             <select
//               name="institution"
//               value={form.institution}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             >
//               <option value="">Select Institution</option>
//               {institutions.map((inst) => (
//                 <option key={inst._id} value={inst._id}>
//                   {inst.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Department */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Department
//             </label>
//             <input
//               name="department"
//               type="text"
//               placeholder="Enter your department"
//               value={form.department}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Talents */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Talents / Skills
//             </label>
//             <input
//               name="talents"
//               type="text"
//               placeholder="E.g. Singing, Leadership, Sports"
//               value={form.talents}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               name="password"
//               type="password"
//               placeholder="Create a strong password"
//               value={form.password}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600 transition duration-200"
//           >
//             Sign Up
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           Already have an account?{" "}
//           <a href="/login/admin" className="text-green-500 hover:underline">
//             Login here
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function StudentSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    talents: "",
    password: "",
    institution: "",
  });

  const [institutions, setInstitutions] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/institution/getallinstitutes"
        );
        setInstitutions(res.data.institutions || []);
      } catch (err) {
        toast.error("Failed to fetch institutions");
      }
    };
    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (profileImage) fd.append("profileImage", profileImage);

      const res = await axios.post(
        "http://localhost:3000/api/students/studentsignup",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Signup successful! Verify OTP.");
      navigate("/verifyotp", {
        state: { studentId: res.data.userId, role: res.data.role },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-700 via-emerald-600 to-lime-600 p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">

        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Student Signup
        </h1>
        <p className="text-center text-green-100 mt-2 mb-6">
          Create your account and join the platform
        </p>

        {/* Status Message */}
        {message && (
          <p
            className={`text-center mb-4 text-sm font-semibold ${
              message.includes("successful")
                ? "text-green-300"
                : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Profile Upload */}
          <div className="flex flex-col items-center mb-4">
            <label
              htmlFor="profileImage"
              className="cursor-pointer w-28 h-28 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden shadow-xl hover:scale-105 transition-all flex justify-center items-center"
            >
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <span className="text-white text-sm">Upload Photo</span>
              )}
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-white text-sm mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-white text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-white text-sm mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-white text-sm mb-1">
              Institution
            </label>
            <select
              name="institution"
              value={form.institution}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-green-300 outline-none"
            >
              <option value="" className="text-black">
                Select institution
              </option>

              {institutions.map((inst) => (
                <option
                  key={inst._id}
                  value={inst._id}
                  className="text-black"
                >
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-white text-sm mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              placeholder="Enter your department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Talents */}
          <div>
            <label className="block text-white text-sm mb-1">
              Skills / Talents
            </label>
            <input
              type="text"
              name="talents"
              placeholder="E.g. singing, sports, leadership"
              value={form.talents}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-300 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-white mt-6 text-sm">
          Already have an account?{" "}
          <a href="/login/admin" className="text-green-300 underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { motion } from "framer-motion";

// const CoordinatorSignup = () => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phoneNumber: "",
//     department: "",
//     password: "",
//   });
//   const [profileImage, setProfileImage] = useState(null);
//   const [verifyDocument, setVerifyDocument] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const navigate = useNavigate();

//   // handle text input
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // handle profile image input
//   const handleProfileChange = (e) => {
//     const file = e.target.files[0];
//     setProfileImage(file);
//     if (file) {
//       setPreviewImage(URL.createObjectURL(file)); // preview
//     }
//   };

//   // form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();

//     Object.entries(form).forEach(([key, value]) => {
//       formData.append(key, value);
//     });

//     if (profileImage) formData.append("profileImage", profileImage);
//     if (verifyDocument) formData.append("verificationDocument", verifyDocument);

//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/coordinator/coordinatorsignup",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       toast.success(res.data.message);
//       console.log(res.data);

//       navigate("/verifyotp", {
//         state: { coordinatorId: res.data.userId, role: res.data.role },
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex justify-center items-center p-4">
//       <motion.form
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         onSubmit={handleSubmit}
//         className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-green-200 space-y-5"
//       >
//         <h2 className="text-3xl font-semibold text-center text-green-700">
//           Coordinator Registration
//         </h2>
//         <p className="text-center text-gray-500 text-sm mb-2">
//           Register as a department coordinator and manage NSS activities.
//         </p>

//         {/* Input fields */}
//         <div className="space-y-3">
//           {["name", "email", "phoneNumber", "department", "password"].map(
//             (field, idx) => (
//               <input
//                 key={idx}
//                 type={field === "password" ? "password" : "text"}
//                 name={field}
//                 placeholder={
//                   field.charAt(0).toUpperCase() +
//                   field.slice(1).replace(/([A-Z])/g, " $1")
//                 }
//                 onChange={handleChange}
//                 required
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//               />
//             )
//           )}
//         </div>

//         {/* Profile Image Upload */}
//         <div>
//           <label className="text-sm text-gray-700 font-medium">
//             Profile Image (optional)
//           </label>
//           <div className="mt-1 flex items-center gap-3">
//             {previewImage ? (
//               <img
//                 src={previewImage}
//                 alt="Preview"
//                 className="w-16 h-16 rounded-full object-cover border-2 border-green-400 shadow"
//               />
//             ) : (
//               <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-600">
//                 📷
//               </div>
//             )}
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleProfileChange}
//               className="text-sm text-gray-600"
//             />
//           </div>
//         </div>

//         {/* Verification Document Upload */}
//         <div>
//           <label className="text-sm text-gray-700 font-medium">
//             Upload Verification Document (required)
//           </label>
//           <input
//             type="file"
//             accept="image/*,application/pdf"
//             required
//             onChange={(e) => setVerifyDocument(e.target.files[0])}
//             className="w-full text-sm text-gray-600"
//           />
//         </div>

//         {/* Submit Button */}
//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 hover:shadow-lg transition-transform transform hover:-translate-y-1"
//         >
//           Sign Up
//         </button>

//         <p className="text-center text-sm text-gray-500 mt-2">
//           Already registered?{" "}
//           <span
//             onClick={() => navigate("/login")}
//             className="text-green-700 cursor-pointer hover:underline"
//           >
//             Login here
//           </span>
//         </p>
//       </motion.form>
//     </div>
//   );
// };

// export default CoordinatorSignup;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { motion } from "framer-motion";

// const CoordinatorSignup = () => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phoneNumber: "",
//     department: "",
//     password: "",
//     institutionId: "", // new field
//   });
//   const [profileImage, setProfileImage] = useState(null);
//   const [verifyDocument, setVerifyDocument] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [institutions, setInstitutions] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchInstitutions = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:3000/api/institution/getallinstitutes"
//         );
//         // console.log(res.data.institutions)
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

//   const handleProfileChange = (e) => {
//     const file = e.target.files[0];
//     setProfileImage(file);
//     if (file) setPreviewImage(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();

//     Object.entries(form).forEach(([key, value]) => {
//       formData.append(key, value);
//     });

//     if (profileImage) formData.append("profileImage", profileImage);
//     if (verifyDocument) formData.append("verificationDocument", verifyDocument);

//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/coordinator/coordinatorsignup",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       toast.success(res.data.message);
//       navigate("/verifyotp", {
//         state: { coordinatorId: res.data.userId, role: res.data.role },
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex justify-center items-center p-4">
//       <motion.form
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         onSubmit={handleSubmit}
//         className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-green-200 space-y-5"
//       >
//         <h2 className="text-3xl font-semibold text-center text-green-700">
//           Coordinator Registration
//         </h2>
//         <p className="text-center text-gray-500 text-sm mb-2">
//           Register as a department coordinator and manage NSS activities.
//         </p>

//         <div className="space-y-3">
//           {["name", "email", "phoneNumber", "department", "password"].map(
//             (field, idx) => (
//               <input
//                 key={idx}
//                 type={field === "password" ? "password" : "text"}
//                 name={field}
//                 placeholder={
//                   field.charAt(0).toUpperCase() +
//                   field.slice(1).replace(/([A-Z])/g, " $1")
//                 }
//                 onChange={handleChange}
//                 required
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//               />
//             )
//           )}
//         </div>

//         {/* Institution Dropdown */}
//         <div>
//           <label className="text-sm text-gray-700 font-medium">
//             Select Institution
//           </label>
//           <select
//             name="institutionId"
//             required
//             value={form.institutionId}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition mt-1"
//           >
//             <option value="">-- Select Institution --</option>
//             {institutions.map((inst) => (
//               <option key={inst._id} value={inst._id}>
//                 {inst.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Profile Image Upload */}
//         <div>
//           <label className="text-sm text-gray-700 font-medium">
//             Profile Image (optional)
//           </label>
//           <div className="mt-1 flex items-center gap-3">
//             {previewImage ? (
//               <img
//                 src={previewImage}
//                 alt="Preview"
//                 className="w-16 h-16 rounded-full object-cover border-2 border-green-400 shadow"
//               />
//             ) : (
//               <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-600">
//                 📷
//               </div>
//             )}
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleProfileChange}
//               className="text-sm text-gray-600"
//             />
//           </div>
//         </div>

//         {/* Verification Document Upload */}
//         <div>
//           <label className="text-sm text-gray-700 font-medium">
//             Upload Verification Document (required)
//           </label>
//           <input
//             type="file"
//             accept="image/*,application/pdf"
//             required
//             onChange={(e) => setVerifyDocument(e.target.files[0])}
//             className="w-full text-sm text-gray-600"
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 hover:shadow-lg transition-transform transform hover:-translate-y-1"
//         >
//           Sign Up
//         </button>

//         <p className="text-center text-sm text-gray-500 mt-2">
//           Already registered?{" "}
//           <span
//             onClick={() => navigate("/login")}
//             className="text-green-700 cursor-pointer hover:underline"
//           >
//             Login here
//           </span>
//         </p>
//       </motion.form>
//     </div>
//   );
// };

// export default CoordinatorSignup;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";

const CoordinatorSignup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    password: "",
    institutionId: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [verifyDocument, setVerifyDocument] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [institutions, setInstitutions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/institution/getallinstitutes"
        );
        setInstitutions(res.data.institutions);
      } catch (err) {
        toast.error("Failed to load institutions");
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (profileImage) fd.append("profileImage", profileImage);
    if (verifyDocument) fd.append("verificationDocument", verifyDocument);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/coordinator/coordinatorsignup",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(res.data.message);
      navigate("/verifyotp", {
        state: { coordinatorId: res.data.userId, role: res.data.role },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-green-900 p-4">
      <motion.form
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10 space-y-6"
      >
        {/* Heading */}
        <h2 className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Coordinator Signup
        </h2>
        <p className="text-center text-green-100 text-sm">
          Register to manage NSS activities and your department.
        </p>

        {/* Inputs */}
        <div className="space-y-4">
          {["name", "email", "phoneNumber", "department", "password"].map(
            (field, idx) => (
              <input
                key={idx}
                type={field === "password" ? "password" : "text"}
                name={field}
                required
                placeholder={
                  field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/([A-Z])/g, " $1")
                }
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 border border-white/30 
                text-white placeholder-white/70 outline-none
                focus:ring-2 focus:ring-green-300 transition"
              />
            )
          )}
        </div>

        {/* Institution */}
        <div>
          <label className="text-sm text-white mb-1 block">Institution</label>
          <select
            name="institutionId"
            value={form.institutionId}
            required
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 
            text-white outline-none focus:ring-2 focus:ring-green-300 transition"
          >
            <option value="" className="text-black">
              -- Select Institution --
            </option>
            {institutions.map((inst) => (
              <option key={inst._id} value={inst._id} className="text-black">
                {inst.name}
              </option>
            ))}
          </select>
        </div>

        {/* Profile Image */}
        <div>
          <label className="text-sm text-white block mb-1">
            Profile Image (optional)
          </label>

          <div className="flex items-center gap-4">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-16 h-16 rounded-full border-2 border-green-300 
                object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center 
              bg-white/20 border border-white/40 text-white shadow">
                📷
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="text-white/90 text-sm"
            />
          </div>
        </div>

        {/* Verification Document */}
        <div>
          <label className="text-sm text-white block mb-1">
            Verification Document (required)
          </label>
          <input
            type="file"
            required
            accept="image/*,application/pdf"
            onChange={(e) => setVerifyDocument(e.target.files[0])}
            className="w-full text-white/90 text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold 
          hover:bg-green-600 hover:shadow-lg transition-all duration-200"
        >
          Sign Up
        </button>

        {/* Login */}
        <p className="text-center text-white text-sm">
          Already registered?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-300 underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </motion.form>
    </div>
  );
};

export default CoordinatorSignup;

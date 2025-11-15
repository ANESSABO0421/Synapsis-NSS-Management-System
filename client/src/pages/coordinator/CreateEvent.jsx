// import React from "react";
// import { useEffect } from "react";
// import { useState } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import CircularProgress from "@mui/material/CircularProgress";

// const CreateEvent = () => {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     location: "",
//     hours: "",
//     institutionId: "",
//     caption: "",
//   });
//   const [image, setImage] = useState(null);
//   const [institutions, setInstitutions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchInstitutions = async (req, res) => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           "http://localhost:3000/api/institution/getallinstitutes"
//         );
//         setInstitutions(res.data.institutions);
//       } catch (error) {
//         toast.error(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInstitutions();
//   }, []);

//   if (loading) {
//     return (
//       <CircularProgress color="success">Dashboard loading</CircularProgress>
//     );
//   }

//   const handleFileChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/coordinator/createevents",
//         formData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success("created event successfully");
//     } catch (error) {
//       toast.error("failed to send data:", error.message);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-5">
//       <input
//         type="text"
//         name="title"
//         placeholder="title"
//         className="border-1 p-2"
//         value={formData.title}
//         onChange={handleChange}
//       />
//       <input
//         type="text"
//         name="description"
//         placeholder="description"
//         className="border-1 p-2"
//         value={formData.description}
//         onChange={handleChange}
//       />
//       <input
//         type="text"
//         name="location"
//         placeholder="Location"
//         className="border-1 p-2"
//         value={formData.location}
//         onChange={handleChange}
//       />
//       <input
//         type="date"
//         name="date"
//         placeholder="date"
//         className="border-1 p-2"
//         value={formData.date}
//         onChange={handleChange}
//       />
//       <input
//         type="number"
//         name="hours"
//         placeholder="hours"
//         className="border-1 p-2"
//         value={formData.hours}
//         onChange={handleChange}
//       />
//       <input
//         type="file"
//         name="image"
//         placeholder="hours"
//         className="border-1 p-2"
//         onChange={handleFileChange}
//       />
//       <select
//         name="institutionId"
//         value={formData.institutionId}
//         onChange={handleChange}
//         className="w-full border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
//         required
//       >
//         <option value="">Select Institution</option>
//         {institutions.map((inst) => (
//           <option key={inst._id} value={inst._id}>
//             {inst.name}
//           </option>
//         ))}
//       </select>
//       <button
//         type="submit"
//         onClick={() => handleSubmit()}
//         className="bg-green-500 p-2 hover:bg-green-600 transition-all duration-300"
//       >
//         Submit
//       </button>
//     </div>
//   );
// };

// export default CreateEvent;

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    hours: "",
    caption: "",
  });

  const [image, setImage] = useState(null);
  const [institutionId, setInstitutionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/coordinator/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(res.data.data.institution)
        setInstitutionId(res.data.data.institution);
        
      } catch (error) {
        toast.error("Failed to fetch coordinator details");
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinator();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!institutionId) {
      return toast.error("Institution not found. Please re-login.");
    }

    try {
      setSubmitting(true);

      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        form.append(key, value)
      );
      form.append("institutionId", institutionId);
      if (image) form.append("images", image);

      const res = await axios.post(
        "http://localhost:3000/api/coordinator/createevents",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data.message || "Event created successfully!");
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        hours: "",
        caption: "",
      });
      setImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-100 to-green-200">
        <CircularProgress color="success" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-10"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-emerald-700 drop-shadow-sm">
          🌿 Create New NSS Event
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {[
            { name: "title", type: "text", placeholder: "Event Title" },
            { name: "location", type: "text", placeholder: "Event Location" },
            { name: "date", type: "date", placeholder: "Event Date" },
            { name: "hours", type: "number", placeholder: "Duration (hours)" },
            {
              name: "caption",
              type: "text",
              placeholder: "Image Caption (optional)",
            },
          ].map((input) => (
            <motion.input
              key={input.name}
              type={input.type}
              name={input.name}
              placeholder={input.placeholder}
              value={formData[input.name]}
              onChange={handleChange}
              whileFocus={{ scale: 1.02 }}
              className="border border-emerald-300 bg-white/60 placeholder-gray-500 p-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none transition duration-200"
              required={input.name !== "caption"}
            />
          ))}

          <motion.textarea
            name="description"
            placeholder="Event Description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            whileFocus={{ scale: 1.02 }}
            className="border border-emerald-300 bg-white/60 placeholder-gray-500 p-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none transition duration-200 resize-none"
            required
          />

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-emerald-700 font-medium mb-2">
              Upload Event Image
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-emerald-300 bg-white/60 p-2 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 transition-all duration-300"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.05 }}
            whileTap={{ scale: submitting ? 1 : 0.97 }}
            className={`w-full py-3 rounded-xl text-lg font-semibold text-white shadow-lg transition-all duration-300 ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            }`}
          >
            {submitting ? (
              <CircularProgress size={26} color="inherit" />
            ) : (
              "✨ Create Event"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateEvent;

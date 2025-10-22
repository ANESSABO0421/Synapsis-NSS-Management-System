import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    hours: "",
    institutionId: "",
    caption: "",
  });
  const [image, setImage] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInstitutions = async (req, res) => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:3000/api/institution/getallinstitutes"
        );
        setInstitutions(res.data.institutions);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  if (loading) {
    return (
      <CircularProgress color="success">Dashboard loading</CircularProgress>
    );
  }

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/coordinator/createevents",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("created event successfully");
    } catch (error) {
      toast.error("failed to send data:", error.message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        type="text"
        name="title"
        placeholder="title"
        className="border-1 p-2"
        value={formData.title}
        onChange={handleChange}
      />
      <input
        type="text"
        name="description"
        placeholder="description"
        className="border-1 p-2"
        value={formData.description}
        onChange={handleChange}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        className="border-1 p-2"
        value={formData.location}
        onChange={handleChange}
      />
      <input
        type="date"
        name="date"
        placeholder="date"
        className="border-1 p-2"
        value={formData.date}
        onChange={handleChange}
      />
      <input
        type="number"
        name="hours"
        placeholder="hours"
        className="border-1 p-2"
        value={formData.hours}
        onChange={handleChange}
      />
      <input
        type="file"
        name="image"
        placeholder="hours"
        className="border-1 p-2"
        onChange={handleFileChange}
      />
      <select
        name="institutionId"
        value={formData.institutionId}
        onChange={handleChange}
        className="w-full border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
        required
      >
        <option value="">Select Institution</option>
        {institutions.map((inst) => (
          <option key={inst._id} value={inst._id}>
            {inst.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        onClick={() => handleSubmit()}
        className="bg-green-500 p-2 hover:bg-green-600 transition-all duration-300"
      >
        Submit
      </button>
    </div>
  );
};

export default CreateEvent;

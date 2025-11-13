import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const GetAllPendingAlumni = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingAlumni = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please login first.");
        return;
      }

      const res = await axios.get("http://localhost:3000/api/alumni/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlumniList(res.data.alumni || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/api/alumni/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      fetchPendingAlumni();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/api/alumni/reject/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      fetchPendingAlumni();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  useEffect(() => {
    fetchPendingAlumni();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Pending Alumni Approvals
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : alumniList.length === 0 ? (
        <p className="text-gray-600">No pending alumni found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-left border border-gray-200">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Graduation Year</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alumniList.map((alumni) => (
                <tr
                  key={alumni._id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-3 font-medium text-gray-800">{alumni.name}</td>
                  <td className="p-3 text-gray-600">{alumni.email}</td>
                  <td className="p-3 text-gray-600">
                    {alumni.institution?.name || "N/A"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {alumni.graduationYear || "N/A"}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => handleApprove(alumni._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FiCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(alumni._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FiXCircle /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetAllPendingAlumni;

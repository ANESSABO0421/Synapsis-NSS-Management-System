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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Heading */}
      <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Pending Alumni Approvals
      </h1>

      {/* Loading State */}
      {loading ? (
        <p className="text-center text-gray-600 text-lg">Loading...</p>
      ) : alumniList.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          🎉 No pending alumni found.
        </p>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
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
                    <td className="p-3 font-medium text-gray-800">
                      {alumni.name}
                    </td>

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

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-4 mt-4">
            {alumniList.map((alumni) => (
              <div
                key={alumni._id}
                className="bg-white rounded-xl shadow p-4 border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {alumni.name}
                </h2>
                <p className="text-gray-600 text-sm">{alumni.email}</p>

                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Institution:{" "}
                    <span className="font-medium text-gray-700">
                      {alumni.institution?.name || "N/A"}
                    </span>
                  </p>

                  <p className="text-sm text-gray-500">
                    Graduation Year:{" "}
                    <span className="font-medium text-gray-700">
                      {alumni.graduationYear || "N/A"}
                    </span>
                  </p>
                </div>

                {/* Mobile Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(alumni._id)}
                    className="w-full rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiCheckCircle /> Approve
                    </div>
                  </button>

                  <button
                    onClick={() => handleReject(alumni._id)}
                    className="w-full rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiXCircle /> Reject
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GetAllPendingAlumni;

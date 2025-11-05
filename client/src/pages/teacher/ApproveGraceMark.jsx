import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaUserGraduate, FaClipboardList } from "react-icons/fa";

const ApproveGraceMark = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api";

  // ✅ Fetch pending recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/teacher/pending-recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch pending recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // ✅ Approve or Reject Recommendation
  const handleDecision = async (studentId, approve) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/teacher/approverecommendedgracemark`,
        { studentId, approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(approve ? "✅ Grace mark approved!" : "❌ Recommendation rejected!");
      setRecommendations((prev) => prev.filter((r) => r.id !== studentId));
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-10 sm:px-6 lg:px-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-green-800 text-center mb-10"
      >
        Approve Recommended Grace Marks
      </motion.h1>

      {loading && (
        <p className="text-center text-gray-600 mb-4 animate-pulse">
          Loading recommendations...
        </p>
      )}

      {recommendations.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 text-lg py-10"
        >
          No pending recommendations 🎉
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 max-w-7xl mx-auto border border-green-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaClipboardList className="text-green-600 text-2xl" />
            <h2 className="text-2xl font-semibold text-green-700">
              Pending Grace Mark Requests
            </h2>
          </div>

          {/* ✅ Table View for large screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-xl">
              <thead>
                <tr className="bg-green-100 text-green-800">
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-center">Marks</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-t hover:bg-green-50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                      <FaUserGraduate className="text-green-600" />
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3 text-center font-semibold text-green-700">
                      {r.marks}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.reason}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleDecision(r.id, true)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
                      >
                        <FaCheckCircle className="inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(r.id, false)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
                      >
                        <FaTimesCircle className="inline mr-1" />
                        Reject
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Card View for mobile screens */}
          <div className="md:hidden flex flex-col gap-4">
            {recommendations.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaUserGraduate className="text-green-600" />
                  <h3 className="font-semibold text-gray-800">{r.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium text-gray-700">Email:</span> {r.email}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium text-gray-700">Marks:</span> {r.marks}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  <span className="font-medium text-gray-700">Reason:</span> {r.reason}
                </p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => handleDecision(r.id, true)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white w-[48%] py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
                  >
                    <FaCheckCircle className="inline mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(r.id, false)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white w-[48%] py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
                  >
                    <FaTimesCircle className="inline mr-1" />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ApproveGraceMark;

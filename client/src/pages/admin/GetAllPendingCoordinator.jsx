import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, FileText } from "lucide-react";

const GetAllPendingCoordinator = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchCoordinator = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3000/api/coordinator/getallpendingcoordinator",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoordinators(res.data.coordinator);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/coordinator/approvecoordinator/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Coordinator approved successfully!");
      fetchCoordinator();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/coordinator/rejectcoordinator/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Coordinator rejected successfully!");
      fetchCoordinator();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchCoordinator();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Pending Coordinator Approvals
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
      ) : coordinators.length === 0 ? (
        <div className="text-center text-gray-500 font-medium mt-12">
          🎉 No pending coordinators found!
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700 uppercase text-sm">
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Department</th>
                <th className="p-3">Verification Document</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map((coordinator, index) => (
                <tr
                  key={coordinator._id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-3 font-medium text-gray-600">
                    {index + 1}
                  </td>
                  <td className="p-3 font-semibold text-gray-800">
                    {coordinator.name}
                  </td>
                  <td className="p-3 text-gray-600">{coordinator.email}</td>
                  <td className="p-3 text-gray-600">
                    {coordinator.department || "—"}
                  </td>

                  {/* ✅ Verification Document */}
                  <td className="p-3 text-center">
                    {coordinator.verificationDocument?.url ? (
                      <a
                        href={coordinator.verificationDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <FileText className="w-4 h-4" /> View
                      </a>
                    ) : (
                      <span className="text-gray-400">No document</span>
                    )}
                  </td>

                  <td className="p-3 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => handleApprove(coordinator._id)}
                      className="flex items-center gap-1 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-green-600 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(coordinator._id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-red-600 transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Reject
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

export default GetAllPendingCoordinator;

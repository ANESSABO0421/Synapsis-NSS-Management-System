import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const GetAllPendingTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch pending teachers
  const getAllPendingTeacher = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/teacher/pendingteacher", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve teacher
  const handleApprove = async (id, name) => {
    const confirmApprove = window.confirm(
      `Are you sure you want to approve ${name}?`
    );
    if (!confirmApprove) return;

    try {
      await axios.put(
        `http://localhost:3000/api/teacher/approvependingteacher/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ ${name} approved successfully`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  // Reject teacher
  const handleReject = async (id, name) => {
    const confirmReject = window.confirm(
      `Are you sure you want to reject ${name}?`
    );
    if (!confirmReject) return;

    try {
      await axios.put(
        `http://localhost:3000/api/teacher/rejectPendingTeacher/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`❌ ${name} has been rejected`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  useEffect(() => {
    getAllPendingTeacher();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-ping rounded-full bg-green-600"></span>
            <p className="text-sm font-medium text-gray-700">
              Loading pending teachers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-center text-3xl font-bold text-green-600">
            Pending Teacher Approvals
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Review pending requests and take action directly from the table below.
          </p>
        </div>

        {teachers.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
            No pending teachers 🎉
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10 bg-green-600 text-white shadow-sm">
                  <tr>
                    <th className="w-14 px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      #
                    </th>
                    <th className="w-1/4 px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      Name
                    </th>
                    <th className="w-1/3 px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      Email
                    </th>
                    <th className="w-1/6 px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      Department
                    </th>
                    <th className="w-1/5 px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher, index) => (
                    <tr
                      key={teacher._id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-gray-100/80 transition-colors"
                    >
                      <td className="border-b border-gray-100 px-4 py-3 text-gray-500 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 font-medium text-gray-900">
                        {teacher.name}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3 text-gray-700">
                        {teacher.email}
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {teacher.department || "N/A"}
                        </span>
                      </td>
                      <td className="border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleApprove(teacher._id, teacher.name)
                            }
                            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleReject(teacher._id, teacher.name)
                            }
                            className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-600">
                Showing {teachers.length}{" "}
                {teachers.length === 1 ? "entry" : "entries"}
              </p>
              <button
                onClick={getAllPendingTeacher}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllPendingTeacher;

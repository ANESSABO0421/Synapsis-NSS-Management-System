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
      const res = await axios.get(
        "http://localhost:3000/api/teacher/pendingteacher",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(res.data.teachers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve teacher
  const handleApprove = async (id, name) => {
    if (!window.confirm(`Approve ${name}?`)) return;
    try {
      await axios.put(
        `http://localhost:3000/api/teacher/approvependingteacher/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Approved ${name}`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  // Reject teacher
  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}?`)) return;
    try {
      await axios.put(
        `http://localhost:3000/api/teacher/rejectPendingTeacher/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info(`Rejected ${name}`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      toast.error("Rejection failed");
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-center text-2xl sm:text-3xl font-bold text-green-600">
            Pending Teacher Approvals
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Review pending teacher accounts and verify documents.
          </p>
        </div>

        {/* Empty State */}
        {teachers.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
            No pending teachers 🎉
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            {/* Desktop Table */}
            <div className="hidden md:block max-h-[70vh] overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10 bg-green-600 text-white shadow-sm">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      #
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide">
                      Department
                    </th>

                    {/* NEW: Verification Document */}
                    <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide">
                      Verification Document
                    </th>

                    <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide">
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
                      <td className="border-b px-4 py-3 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="border-b px-4 py-3 font-medium text-gray-900">
                        {teacher.name}
                      </td>

                      <td className="border-b px-4 py-3 text-gray-700">
                        {teacher.email}
                      </td>

                      <td className="border-b px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                          {teacher.department}
                        </span>
                      </td>

                      {/* Verification Document */}
                      <td className="border-b px-4 py-3 text-center">
                        <img
                          src={teacher.verificationDocument?.url}
                          alt="Document"
                          className="h-16 w-16 rounded-lg object-cover shadow cursor-pointer hover:scale-105 transition"
                          onClick={() =>
                            window.open(
                              teacher.verificationDocument?.url,
                              "_blank"
                            )
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="border-b px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleApprove(teacher._id, teacher.name)
                            }
                            className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleReject(teacher._id, teacher.name)
                            }
                            className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {teachers.map((teacher, index) => (
                <div
                  key={teacher._id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">#{index + 1}</p>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {teacher.department}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-800 text-lg">
                    {teacher.name}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    {teacher.email}
                  </p>

                  {/* Verification Document */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Verification Document
                    </p>
                    <img
                      src={teacher.verificationDocument?.url}
                      alt="Document"
                      className="h-36 w-full rounded-lg object-cover border shadow cursor-pointer hover:opacity-90 transition"
                      onClick={() =>
                        window.open(
                          teacher.verificationDocument?.url,
                          "_blank"
                        )
                      }
                    />
                    <a
                      href={teacher.verificationDocument?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block w-full text-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      View Document
                    </a>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={() =>
                        handleApprove(teacher._id, teacher.name)
                      }
                      className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleReject(teacher._id, teacher.name)
                      }
                      className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 gap-3">
              <p className="text-xs text-gray-600">
                Showing {teachers.length}{" "}
                {teachers.length === 1 ? "entry" : "entries"}
              </p>
              <button
                onClick={getAllPendingTeacher}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
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

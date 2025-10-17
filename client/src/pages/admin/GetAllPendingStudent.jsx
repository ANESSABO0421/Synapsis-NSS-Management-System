import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";

const GetAllPendingStudent = () => {
  const [student, setStudent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchPendingStudent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/api/students/getallpendingstudent`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudent(res.data.students);
      console.log("Fetched Data:", res.data.students);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // approve
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this student"))
      return;
    try {
      const res = await axios.put(
        `http://localhost:3000/api/students/approvependingstudent/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student approved successfully");
      setStudent((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this student")) return;
    try {
      const res = await axios.put(
        `http://localhost:3000/api/students/rejectstuedent/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student has been rejected successfully");
      setStudent((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchPendingStudent();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CircularProgress color="success" size={20} />
            <p className="text-sm font-medium text-gray-700">
              Loading pending students...
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log(student);
  return (
    <div className="mx-auto max-w-6xl p-8">
      <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Pending Students{" "}
        <span className="text-green-600">({student.length})</span>
      </h2>

      {student.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm">
          <p className="text-lg text-gray-600">No pending students found 🎉</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full table-auto border-separate border-spacing-0 text-sm sm:text-base">
              <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide">
                    Course
                  </th>
                  <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {student.map((item, indx) => (
                  <tr
                    key={item._id}
                    className={`transition-colors ${
                      indx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-green-50`}
                  >
                    <td className="border-b border-gray-100 px-6 py-4 align-middle font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="border-b border-gray-100 px-6 py-4 align-middle text-gray-700">
                      {item.email}
                    </td>
                    <td className="border-b border-gray-100 px-6 py-4 align-middle">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {item.department || "—"}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-6 py-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item._id)}
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
              Showing {student.length}{" "}
              {student.length === 1 ? "entry" : "entries"}
            </p>
            <button
              onClick={fetchPendingStudent}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllPendingStudent;

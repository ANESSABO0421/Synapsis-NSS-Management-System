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
    if (!window.confirm("Are you sure you want to approve this student")) return;
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
      const res = await axios.delete(
        `http://localhost:3000/api/students/rejectstuedent/${id}`,
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
      <div className="flex items-center justify-center h-[500px]">
        <CircularProgress color="success" />
      </div>
    );
  }

  console.log(student);
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Pending Students{" "}
        <span className="text-green-600">({student.length})</span>
      </h2>

      {student.length === 0 ? (
        <div className="text-center py-12 border rounded-2xl bg-gray-50 shadow-inner">
          <p className="text-gray-500 text-lg">No pending students found 🎉</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
              <tr>
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Email</th>
                <th className="py-4 px-6 text-left">Course</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {student.map((item, indx) => (
                <tr
                  key={item._id}
                  className={`border-t transition-all duration-150 ${
                    indx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-green-50`}
                >
                  <td className="py-4 px-6 font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{item.email}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {item.department || "—"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleApprove(item._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all mr-3"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Reject
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

export default GetAllPendingStudent;

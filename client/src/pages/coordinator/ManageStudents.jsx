import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Users, UserCheck, UserX } from "lucide-react";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/coordinator/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // Search by skill
  const handleSearchBySkill = async () => {
    if (!searchTerm.trim()) {
      fetchStudents();
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:3000/api/coordinator/getstudentbyskill/${searchTerm}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      setError("No students found with that skill.");
    } finally {
      setLoading(false);
    }
  };

  // Convert Student → Volunteer
  const handleStudentToVolunteer = async (studentId) => {
    try {
      await axios.post(
        "http://localhost:3000/api/coordinator/studenttovolunteer",
        { studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to change role");
    }
  };

  // Convert Volunteer → Student
  const handleVolunteerToStudent = async (studentId) => {
    try {
      await axios.post(
        "http://localhost:3000/api/coordinator/volunteertostudent",
        { studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to change role");
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-green-700 w-7 h-7" />
        <h2 className="text-3xl font-bold text-green-800">Manage Students</h2>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-3 py-2 outline-none text-gray-700"
          />
          <button
            onClick={handleSearchBySkill}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Search size={18} /> Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        {loading ? (
          <p className="text-center p-6 text-gray-500 animate-pulse">Loading students...</p>
        ) : error ? (
          <p className="text-center text-red-500 p-6">{error}</p>
        ) : students.length > 0 ? (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-green-100 text-green-900 uppercase text-sm">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Skills</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">{student.department}</td>
                  <td className="p-3 text-gray-600">
                    {student.talents?.length > 0
                      ? student.talents.join(", ")
                      : "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.role === "volunteer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {student.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {student.role === "student" ? (
                      <button
                        onClick={() => handleStudentToVolunteer(student._id)}
                        className="flex items-center gap-2 justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition"
                      >
                        <UserCheck size={16} /> Make Volunteer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVolunteerToStudent(student._id)}
                        className="flex items-center gap-2 justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition"
                      >
                        <UserX size={16} /> Make Student
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 p-6">No students found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUser, FiSend, FiBookOpen } from "react-icons/fi";

const RecommendGraceMark = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [marks, setMarks] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // Axios instance
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/coordinator",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 🧭 Fetch Students (only NSS volunteers)
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/students");

      if (res.data.success) {
        // only volunteers
        const volunteers = res.data.students.filter(
          (s) => s.role === "volunteer"
        );
        setStudents(volunteers);
      } else {
        toast.error("Failed to load students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.message || "Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 📤 Submit Grace Mark Recommendation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !marks) {
      toast.warn("Please select student and enter marks");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post("/recommendgracemark", {
        studentId: selectedStudent,
        marks: Number(marks),
        reason,
      });

      if (res.data.success) {
        toast.success("Grace mark recommendation submitted successfully");
        setSelectedStudent("");
        setMarks("");
        setReason("");
      } else {
        toast.error(res.data.message || "Failed to recommend grace mark");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white border-2 border-green-500 shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
          <FiBookOpen /> Grace Mark Recommendation
        </h2>

        {loading ? (
          <p className="text-center text-green-600">Loading students...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Select NSS Volunteer
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-green-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Volunteer</option>
                {students.map((stu) => (
                  <option key={stu._id} value={stu._id}>
                    {stu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Marks Input */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Marks to Recommend
              </label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="e.g., 5"
                className="w-full border border-green-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Reason (optional) */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe reason for recommendation..."
                rows="3"
                className="w-full border border-green-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 text-white font-medium py-2 rounded-lg transition ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FiSend />
              {submitting ? "Submitting..." : "Submit Recommendation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecommendGraceMark;

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

  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/coordinator",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch Students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/students");

      if (res.data.success) {
        const volunteers = res.data.students.filter((s) => s.role === "volunteer");
        setStudents(volunteers);
      } else {
        toast.error("Failed to load students");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Submit Grace Marks
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
        toast.success("Grace mark recommendation submitted!");
        setSelectedStudent("");
        setMarks("");
        setReason("");
      } else {
        toast.error(res.data.message || "Failed to recommend grace mark");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-white border-2 border-green-500 shadow-lg rounded-2xl 
        p-5 sm:p-7 md:p-8 w-full max-w-md sm:max-w-lg">

        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-5 sm:mb-6 flex items-center gap-2">
          <FiBookOpen className="text-green-600" /> Grace Mark Recommendation
        </h2>

        {/* Loading */}
        {loading ? (
          <p className="text-center text-green-600 py-4 animate-pulse text-sm sm:text-base">
            Loading students...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Select Student */}
            <div>
              <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                Select NSS Volunteer
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-green-400 rounded-lg p-2 sm:p-3 
                  text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Volunteer</option>
                {students.map((stu) => (
                  <option key={stu._id} value={stu._id}>
                    {stu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Marks */}
            <div>
              <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                Marks to Recommend
              </label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="e.g., 5"
                className="w-full border border-green-400 rounded-lg p-2 sm:p-3 
                  text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the reason..."
                rows="3"
                className="w-full border border-green-400 rounded-lg p-2 sm:p-3 
                  text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`
                w-full flex items-center justify-center gap-2 text-white font-medium 
                py-2 sm:py-3 rounded-lg text-sm sm:text-base transition
                ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }
              `}
            >
              <FiSend size={18} />
              {submitting ? "Submitting..." : "Submit Recommendation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecommendGraceMark;

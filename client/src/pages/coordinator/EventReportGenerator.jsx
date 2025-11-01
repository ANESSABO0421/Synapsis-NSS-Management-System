import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiActivity,
  FiLogOut,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EventReportGenerator = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/coordinator",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 🧭 Fetch Completed Events
  const fetchCompletedEvents = async () => {
    if (!token) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await axiosInstance.get("/events");
      const completed = res.data.events.filter((e) => e.status === "Completed");
      setEvents(completed);
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to fetch completed events");
      }
    }
  };

  useEffect(() => {
    fetchCompletedEvents();
  }, []);

  // 📄 Generate AI-based Report
  const generateReport = async () => {
    if (!selectedEvent) return toast.warn("Please select an event first");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3000/api/coordinator/pdfgeneration/${selectedEvent._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedEvent.title}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Report generation error:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to generate report");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-green-100">
      

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <FiActivity className="text-green-700 text-3xl" />
          <h2 className="text-3xl font-semibold text-green-800">
            Generate Event Reports
          </h2>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-8 border-l-4 border-green-700 hover:shadow-green-200 transition">
          <h3 className="text-lg font-semibold mb-4 text-green-800">
            Select Completed Event
          </h3>

          {events.length === 0 ? (
            <p className="text-gray-500 italic">
              No completed events available.
            </p>
          ) : (
            <select
              className="border-2 border-green-300 focus:border-green-700 focus:ring-green-700 focus:ring-1 outline-none transition p-3 rounded-lg w-full mb-6 bg-green-50"
              onChange={(e) => {
                const ev = events.find((x) => x._id === e.target.value);
                setSelectedEvent(ev);
              }}
            >
              <option value="">-- Select Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({new Date(ev.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={generateReport}
            disabled={loading || !selectedEvent}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium text-lg shadow-md transition ${
              loading || !selectedEvent
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin border-t-2 border-white border-solid rounded-full w-4 h-4"></span>
                Generating...
              </>
            ) : (
              <>
                <FiDownload /> Generate PDF Report
              </>
            )}
          </button>

          {loading && (
            <p className="text-sm text-green-700 mt-3 animate-pulse">
              Please wait, generating your report...
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventReportGenerator;

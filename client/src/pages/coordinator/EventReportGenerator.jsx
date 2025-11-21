import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiActivity } from "react-icons/fi";
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

  // Fetch Completed Events
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

  // Generate PDF
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
    <div className="flex min-h-screen bg-green-50 p-4 sm:p-6 md:p-10">
      {/* Main Content */}
      <main className="flex-1 w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 mb-6">
          <FiActivity className="text-green-700 text-3xl sm:text-4xl" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-green-800">
            Generate Event Reports
          </h2>
        </div>

        {/* Report Card */}
        <div className="bg-white shadow-xl rounded-2xl p-5 sm:p-8 border-l-4 border-green-700 hover:shadow-green-200 transition-all">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-800">
            Select Completed Event
          </h3>

          {/* Event Dropdown */}
          {events.length === 0 ? (
            <p className="text-gray-500 italic text-sm sm:text-base">
              No completed events available.
            </p>
          ) : (
            <select
              className="
                border-2 border-green-300 
                focus:border-green-700 
                focus:ring-green-700 
                focus:ring-1
                outline-none 
                transition 
                p-3 
                rounded-lg 
                w-full 
                bg-green-50 
                text-sm
                sm:text-base
                mb-6
              "
              onChange={(e) => {
                const ev = events.find((x) => x._id === e.target.value);
                setSelectedEvent(ev);
              }}
            >
              <option value=""> Select Event </option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>a
                  {ev.title} ({new Date(ev.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}

          {/* Generate Button */}
          <button
            onClick={generateReport}
            disabled={loading || !selectedEvent}
            className={`flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3 
              rounded-lg text-white font-medium 
              text-sm sm:text-lg shadow-md w-full sm:w-auto transition
              ${
                loading || !selectedEvent
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              }
            `}
          >
            {loading ? (
              <>
                <span className="animate-spin border-t-2 border-white rounded-full w-4 h-4"></span>
                Generating...
              </>
            ) : (
              <>
                <FiDownload /> Generate PDF Report
              </>
            )}
          </button>

          {/* Loading Message */}
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

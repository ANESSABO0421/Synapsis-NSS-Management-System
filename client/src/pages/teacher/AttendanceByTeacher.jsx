import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AttendanceByTeacher = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api"; // 🔧 Change this if needed

  // ✅ Fetch events assigned to logged-in teacher
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/teacher/teachermyevents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setEvents(res.data.data || []);
        } else {
          toast.error(res.data.message || "No events found");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  // ✅ On event click, fetch assigned volunteers
  const handleSelectEvent = async (eventId) => {
    setSelectedEvent(eventId);
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/events/participantsofevents/${eventId}`);
      if (res.data.success) {
        const participants = res.data.participants || [];
        setStudents(participants);
        const initialAttendance = {};
        participants.forEach((s) => (initialAttendance[s._id] = "Present"));
        setAttendance(initialAttendance);
      } else {
        toast.error(res.data.message || "No volunteers found");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error loading volunteers");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change attendance
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // ✅ Submit attendance
  const handleSubmit = async () => {
    if (!selectedEvent) return toast.error("Please select an event first");
    try {
      const token = localStorage.getItem("token");
      const attendanceList = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      const res = await axios.post(
        `${API_BASE}/teacher/attendance/${selectedEvent}`,
        { attendanceList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) toast.success("Attendance marked successfully!");
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  // ✅ Generate Attendance PDF
  const handleGeneratePdf = async () => {
    if (!selectedEvent) return toast.error("Select an event first!");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/teacher/attendance/pdf/${selectedEvent}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance_report.pdf";
      a.click();
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        📋 Attendance Management
      </h2>

      {/* ✅ Step 1: Show All Events */}
      {!selectedEvent ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 text-center">
            Select an Event to Manage
          </h3>

          {events.length === 0 ? (
            <p className="text-center text-gray-500">No events assigned yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => handleSelectEvent(event._id)}
                  className="p-4 bg-white shadow-md border rounded-xl hover:shadow-lg hover:border-green-400 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">📍 {event.location}</p>
                  </div>
                  <span
                    className={`mt-3 text-xs font-medium px-2 py-1 w-fit rounded-full ${
                      event.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ✅ Step 2: Attendance Table */
        <div className="bg-white p-6 rounded-xl shadow-lg border max-w-5xl mx-auto">
          <button
            className="mb-4 text-sm text-blue-600 hover:underline"
            onClick={() => setSelectedEvent(null)}
          >
            ← Back to Events
          </button>

          <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">
            Mark Attendance
          </h3>

          {loading ? (
            <p className="text-center text-gray-500">Loading volunteers...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 border">#</th>
                    <th className="px-3 py-2 border text-left">Name</th>
                    <th className="px-3 py-2 border text-left hidden sm:table-cell">
                      Department
                    </th>
                    <th className="px-3 py-2 border text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((s, i) => (
                      <tr
                        key={s._id}
                        className="hover:bg-gray-50 transition text-gray-700"
                      >
                        <td className="px-3 py-2 border text-center">{i + 1}</td>
                        <td className="px-3 py-2 border">{s.name}</td>
                        <td className="px-3 py-2 border hidden sm:table-cell">
                          {s.department || "-"}
                        </td>
                        <td className="px-3 py-2 border text-center">
                          <select
                            value={attendance[s._id] || "Present"}
                            onChange={(e) =>
                              handleAttendanceChange(s._id, e.target.value)
                            }
                            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-gray-500 py-4 italic"
                      >
                        No volunteers assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition"
              >
                ✅ Submit Attendance
              </button>
              <button
                onClick={handleGeneratePdf}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                📄 Generate PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceByTeacher;

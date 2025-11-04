import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CalendarDays,
  MapPin,
  Clock,
  GraduationCap,
  ImagePlus,
  Pencil,
} from "lucide-react";

const MyEventsTeacher = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // States for modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    hours: "",
    status: "",
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/teacher/teachermyevents", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setEvents(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date.split("T")[0],
      location: event.location,
      hours: event.hours,
      status: event.status,
    });
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/api/teacher/${selectedEvent._id}/edit`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Event updated successfully");
        setSelectedEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error("Error updating event:", err);
      toast.error(err.response?.data?.message || "Failed to update event");
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!images.length) return toast.warning("Please select images first");

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3000/api/teacher/${selectedEvent._id}/uploadimages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Images uploaded successfully");
        setImages([]);
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    return e.status?.toLowerCase() === filter.toLowerCase();
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading events...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          My Assigned Events
        </h2>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {["all", "upcoming", "completed"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1 rounded-full border text-sm font-medium transition-all ${
                filter === type
                  ? "bg-green-600 text-white border-green-600 shadow-md"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length ? (
          filtered.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-green-400 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                {event.title}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-green-600" />
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  {event.location || "Location not specified"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  {event.hours} hrs
                </p>
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  {event.institution}
                </p>
              </div>

              <div className="mt-3">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    event.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : event.status === "Upcoming"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              {/* Action Buttons */}
              {/* <div className="mt-5 flex gap-3">
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  Mark Attendance
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  View Attendance
                </button>
              </div> */}

              {/* New Buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleEditClick(event)}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  <ImagePlus size={16} /> Upload
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <p className="text-gray-500 italic">No {filter} events found.</p>
          </div>
        )}
      </div>

      {/* ====================== */}
      {/* Edit / Upload Modal */}
      {/* ====================== */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editForm.title ? "Edit Event" : "Upload Images"}
            </h3>

            {/* Edit Event Form */}
            {editForm.title && (
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Title"
                  className="w-full border p-2 rounded-lg"
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Description"
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Location"
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="number"
                  name="hours"
                  value={editForm.hours}
                  onChange={(e) =>
                    setEditForm({ ...editForm, hours: e.target.value })
                  }
                  placeholder="Hours"
                  className="w-full border p-2 rounded-lg"
                />
                <select
                  name="status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                >
                  <option>Upcoming</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Upload Images Form */}
            {!editForm.title && (
              <form onSubmit={handleImageUpload} className="space-y-4">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setImages([...e.target.files])}
                  className="w-full border p-2 rounded-lg"
                />

                {/* Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Array.from(images).map((file, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsTeacher;

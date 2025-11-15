import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, Trash2 } from "lucide-react";

const TeacherAnnouncement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/notification", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data.notifications || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/notification/read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Mark Read Error:", err);
    }
  };

  // Mark all as read
  const markAll = async () => {
    try {
      await axios.put(
        "http://localhost:3000/api/notification/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Mark All Read Error:", err);
    }
  };

  // Delete one notification
  const deleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/notification/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete One Error:", err);
    }
  };

  // Delete all notifications
  const deleteAll = async () => {
    try {
      await axios.delete("http://localhost:3000/api/notification", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications([]);
    } catch (err) {
      console.error("Clear All Error:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 text-lg">
        Loading notifications...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Notifications
        </h1>

        <div className="flex gap-3">
          <button
            onClick={markAll}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white shadow transition"
          >
            Mark All Read
          </button>

          <button
            onClick={deleteAll}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white shadow transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-16 text-lg">
          No notifications available.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div
              key={note._id}
              className={`p-5 rounded-xl shadow-md transition-all border backdrop-blur-md
                ${
                  note.read
                    ? "bg-white/60 border-gray-200"
                    : "bg-yellow-100/80 border-yellow-300"
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {note.title}
                  </h3>
                  <p className="text-gray-700 mt-1">{note.message}</p>

                  {note.event && (
                    <p className="text-xs mt-2 text-gray-500">
                      Event ID: {note.event}
                    </p>
                  )}

                  <p className="text-xs mt-2 text-gray-400">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!note.read && (
                    <button
                      onClick={() => markAsRead(note._id)}
                      className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
                    >
                      <Check size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteOne(note._id)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAnnouncement;

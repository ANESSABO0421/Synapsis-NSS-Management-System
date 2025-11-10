import React from "react";
import { CalendarDays } from "lucide-react";

const StudentEventList = ({ events, onSelect, selected }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-600 to-emerald-500 text-white flex items-center gap-2 sticky top-0 z-10 shadow-md">
        <CalendarDays className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold">My Events</h2>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">
            No registered events yet 🌱
          </div>
        ) : (
          events.map((event) => {
            const isSelected = selected?._id === event._id;
            return (
              <div
                key={event._id}
                onClick={() => onSelect(event)}
                className={`cursor-pointer p-4 mb-3 rounded-xl border transition-all shadow-sm ${
                  isSelected
                    ? "bg-emerald-100 border-green-500 ring-1 ring-green-400"
                    : "bg-white hover:bg-green-50 hover:border-emerald-200"
                }`}
              >
                <h3 className={`font-semibold ${isSelected ? "text-green-700" : "text-gray-800"}`}>
                  {event.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  📅 {event.date ? new Date(event.date).toLocaleDateString() : "No date"}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {event.description || "No description available"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentEventList;

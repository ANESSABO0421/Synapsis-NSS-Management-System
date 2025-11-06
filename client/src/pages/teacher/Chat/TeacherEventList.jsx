import React from "react";
import { CalendarDays } from "lucide-react";

const TeacherEventList = ({ events, onSelect, selected }) => {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-md">
      {/* Header */}
      <div className="p-4 border-b bg-green-600 text-white flex items-center gap-2 sticky top-0 z-10">
        <CalendarDays className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold tracking-wide">
          My Teaching Events
        </h2>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
            No events assigned yet.
          </div>
        ) : (
          events.map((event) => {
            const isSelected = selected?._id === event._id;
            return (
              <div
                key={event._id}
                onClick={() => onSelect(event)}
                className={`cursor-pointer p-4 mb-2 rounded-xl border transition-all shadow-sm ${
                  isSelected
                    ? "bg-green-50 border-green-400 ring-1 ring-green-300"
                    : "bg-white hover:bg-gray-50 hover:border-green-200"
                }`}
              >
                <h3
                  className={`font-semibold text-sm sm:text-base ${
                    isSelected ? "text-green-700" : "text-gray-800"
                  }`}
                >
                  {event.title || "Untitled Event"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  📆{" "}
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "No date available"}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {event.Description || "No description provided"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeacherEventList;

import React, { useEffect, useState } from "react";
import axios from "axios";

const EventDisplay = () => {
  const [events, setEvents] = useState([]);

  const getAllEvents = async () => {
    const res = await axios.get("http://localhost:3000/api/events/getallevent");
    setEvents(res.data.events.slice(0, 3));
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-12 bg-gradient-to-tr from-green-50 to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 drop-shadow-md">
          Upcoming <span className="text-green-600">Events</span>
        </h2>
        <p className="text-gray-700 mt-4 max-w-2xl mx-auto text-lg">
          Engaging students in programs that inspire change, uplift communities,
          and build a better society.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto items-stretch">
        {events.map((event, i) => (
          <div
            key={i}
            className="relative bg-white/80 backdrop-blur-md border border-green-300 rounded-3xl p-6 shadow-xl shadow-green-200/50
                       hover:shadow-[0_12px_25px_rgba(16,185,129,0.5)] transition-shadow duration-300 cursor-pointer 
                       flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-green-600 mb-3 tracking-wide drop-shadow">
                {event.title}
              </h2>
              <p className="text-gray-700 mb-6 min-h-[60px]">
                {event.description}
              </p>
              <div className="space-y-1 text-sm text-gray-600 font-semibold">
                <p>
                  Location:{" "}
                  <span className="font-normal">{event.location}</span>
                </p>
                <p>
                  Date:{" "}
                  <span className="font-normal">
                    {event.date.split("T")[0]}
                  </span>
                </p>
                <p>
                  Hours: <span className="font-normal">{event.hours}</span>
                </p>
              </div>
            </div>
            <button
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-green-500 to-teal-400 text-white py-3 font-semibold
                               shadow-lg hover:from-green-600 hover:to-teal-500 transition duration-300"
            >
              View Details
            </button>
            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-green-300 blur-xl opacity-30 pointer-events-none"></div>
          </div>
        ))}
      </div>

      <button
        onClick={getAllEvents}
        className="mt-10 bg-green-600 text-white p-4 rounded-3xl font-bold shadow-lg hover:bg-green-800 transition ease-out duration-200 cursor-pointer max-w-md w-full"
      >
        Get all events
      </button>
    </div>
  );
};

export default EventDisplay;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../utils/api";

const EventDisplay = () => {
  const [events, setEvents] = useState([]);

  const getAllEvents = async () => {
    const res = await axios.get("http://localhost:3000/api/events/getallevent");
    setEvents(res.data.events);
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Upcoming<span className="text-green-600"> Events</span>
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Engaging students in programs that inspire change, uplift communities,
          and build a better society.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              {event.title}
            </h2>

            <p className="text-gray-600 text-sm mb-4">{event.description}</p>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Location:<span className="font-medium">{" "}{event.location}</span>
              </p>
              <p>
                Date:<span className="font-medium">{" "}{event.date.split("T")[0]} </span>
              </p>
              <p>
                Hours:<span className="font-medium">{" "}{event.hours}</span>
              </p>
            </div>

            <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
              View Details
            </button>
          </div>
        ))}
      </div>
        <button className=" bg-green-600 text-white p-4 rounded-2xl hover:bg-green-800 ease-out duration-200 cursor-pointer">Get all events</button>
    </div>
  );
};

export default EventDisplay;

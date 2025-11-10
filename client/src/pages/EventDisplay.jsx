import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const EventDisplay = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const cardsRef = useRef([]);

  const getAllEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/events/getallevent");
      setEvents(res.data.events.slice(0, 3));
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  useEffect(() => {
    gsap.set(cardsRef.current, { opacity: 0, y: 50 });

    gsap.to(cardsRef.current, {
      scrollTrigger: {
        trigger: "#events",
        start: "top 80%",
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15,
    });
  }, [events]);

  return (
    <section
      id="events"
      className="relative w-full bg-white py-28 px-8 sm:px-16 lg:px-24 overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="inline-block border-l-4 border-green-600 pl-4 mb-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 tracking-tight">
            Upcoming{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
              Events
            </span>
          </h2>
        </div>
        <p className="text-green-700 max-w-2xl mx-auto text-base md:text-lg">
          Be part of meaningful initiatives and make an impact through NSS.
        </p>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {events.map((event, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            onClick={() => setSelectedEvent(event)}
            className="group relative bg-white border border-green-200 rounded-3xl p-6 shadow-[0_10px_40px_rgba(34,197,94,0.1)] hover:shadow-[0_15px_60px_rgba(34,197,94,0.2)] hover:-translate-y-2 transition-all duration-500 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-green-400/50 transition-all duration-300"></div>

            <h2 className="text-2xl font-bold text-green-700 mb-3">
              {event.title}
            </h2>
            <p className="text-green-800/90 mb-6 line-clamp-3">
              {event.description}
            </p>
            <div className="space-y-1 text-sm text-green-700 font-semibold">
              <p>
                📍 Location:{" "}
                <span className="font-normal text-green-800">
                  {event.location}
                </span>
              </p>
              <p>
                📅 Date:{" "}
                <span className="font-normal text-green-800">
                  {event.date.split("T")[0]}
                </span>
              </p>
              <p>
                ⏰ Hours:{" "}
                <span className="font-normal text-green-800">
                  {event.hours}
                </span>
              </p>
            </div>

            <button className="mt-6 w-full rounded-full bg-gradient-to-r from-green-500 to-teal-400 text-white py-3 font-semibold shadow-lg hover:from-green-600 hover:to-teal-500 hover:shadow-green-400/40 transition duration-300">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Get All Button */}
      <div className="flex justify-center mt-12">
        <button
          onClick={getAllEvents}
          className="bg-gradient-to-r from-green-600 to-teal-500 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-green-400/50 transition duration-300"
        >
          Get All Events
        </button>
      </div>

      {/* Slide-in Event Details */}
      {selectedEvent && (
        <div className="fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white shadow-2xl z-50 flex flex-col animate-[slideIn_0.6s_ease-out_forwards]">
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-green-100">
            <h3 className="text-2xl font-bold text-green-700">
              {selectedEvent.title}
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-2 hover:bg-green-50 rounded-full transition"
            >
              <X className="w-6 h-6 text-green-700" />
            </button>
          </div>

          {/* Details */}
          <div className="p-6 flex-1 overflow-y-auto text-green-800">
            <p className="mb-6 leading-relaxed">{selectedEvent.description}</p>

            <div className="space-y-3 font-semibold">
              <p>
                📍 Location:{" "}
                <span className="font-normal">{selectedEvent.location}</span>
              </p>
              <p>
                📅 Date:{" "}
                <span className="font-normal">
                  {selectedEvent.date.split("T")[0]}
                </span>
              </p>
              <p>
                ⏰ Duration:{" "}
                <span className="font-normal">{selectedEvent.hours} hrs</span>
              </p>
            </div>

            <div className="sticky bottom-0 mt-10 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-green-100 py-6">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  window.location.href = "/login";
                }}
                className="w-full bg-gradient-to-r from-green-500 to-teal-400 text-white font-bold py-3 rounded-full shadow-lg hover:from-green-600 hover:to-teal-500 transition duration-300"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventDisplay;

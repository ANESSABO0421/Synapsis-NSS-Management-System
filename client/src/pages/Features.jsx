import React from "react";
import { FaUsers, FaCalendarCheck, FaChartLine, FaHandshake } from "react-icons/fa";

const Features = () => {
  return (
    <section
      id="features"
      className="w-full bg-white py-20 px-6 lg:px-16"
    >
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Key Features of <span className="text-green-600">Synapsis</span>
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Synapsis helps NSS volunteers, teachers, and alumni connect seamlessly, 
          making it easy to track contributions, organize events, and celebrate impact.  
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <FaUsers className="text-green-600 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Volunteer Management</h3>
          <p className="text-gray-600 text-sm">
            Register, track, and manage volunteers with ease while building strong NSS teams.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <FaCalendarCheck className="text-green-600 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Event Tracking</h3>
          <p className="text-gray-600 text-sm">
            Organize and join events, monitor participation, and keep everyone informed. 
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <FaChartLine className="text-green-600 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Insights</h3>
          <p className="text-gray-600 text-sm">
            Gain insights into volunteer hours, activities, and overall impact in real time.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <FaHandshake className="text-green-600 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Alumni Connect</h3>
          <p className="text-gray-600 text-sm">
            Build a bridge between students, alumni, and mentors to strengthen NSS connections.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;

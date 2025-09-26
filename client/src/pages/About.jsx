import React from "react";

const About = () => {
  return (
    <section
      id="about"
      className="relative w-full bg-gray-50 py-20 px-6 lg:px-16"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
            About <span className="text-green-600">Synapsis</span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Synapsis is an all-in-one NSS Management Portal built for{" "}
            <span className="font-semibold">students, teachers, alumni, and volunteers</span>. 
            It helps you track volunteer hours, manage events, and connect with 
            like-minded individuals who are passionate about creating meaningful 
            social impact.
          </p>

          {/* Bullet Points */}
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-sm">
                ✓
              </span>
              Track and manage your volunteer hours with ease
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-sm">
                ✓
              </span>
              Stay updated on events and NSS activities
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-sm">
                ✓
              </span>
              Build connections with alumni and volunteers
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-sm">
                ✓
              </span>
              Recognize contributions and showcase impact
            </li>
          </ul>
        </div>

        {/* Right Side: Image/Illustration */}
        <div className="flex justify-center">
          <img
            src="/Synapsis-Logo.png"
            alt="About Synapsis"
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default About;

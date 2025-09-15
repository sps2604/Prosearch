"use client";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="w-full bg-gray-50 py-12 sm:py-16">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 mb-6 sm:mb-8">
          Search for Verified & Skilled Professionals Near You
        </h1>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-3 w-full max-w-5xl mx-auto bg-white border border-gray-200 shadow-md rounded-2xl lg:rounded-full px-4 sm:px-6 py-3 sm:py-4 hover:shadow-lg transition">
          {/* Profession Input */}
          <input
            type="text"
            placeholder="What professional do you need?"
            className="w-full lg:flex-grow px-4 py-3 text-base sm:text-lg text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none rounded-lg lg:rounded-none"
          />

          {/* Location Dropdown */}
          <select className="w-full lg:w-auto px-4 py-3 text-base sm:text-lg text-gray-700 bg-transparent border-t lg:border-t-0 lg:border-l border-gray-200 focus:outline-none rounded-lg lg:rounded-none">
            <option value="">Select Location</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="pune">Pune</option>
          </select>

          {/* Experience Dropdown */}
          <select className="w-full lg:w-auto px-4 py-3 text-base sm:text-lg text-gray-700 bg-transparent border-t lg:border-t-0 lg:border-l border-gray-200 focus:outline-none rounded-lg lg:rounded-none">
            <option value="">Select Experience</option>
            <option value="fresher">Fresher</option>
            <option value="1-3">1 - 3 Years</option>
            <option value="3-5">3 - 5 Years</option>
            <option value="5+">5+ Years</option>
          </select>

          {/* Search Button */}
          <button className="w-full lg:w-auto lg:ml-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg lg:rounded-full transition">
            Search
          </button>
        </div>

        {/* Popular Searches */}
        <p className="mt-6 sm:mt-8 text-sm sm:text-base text-gray-500">
          Popular searches:{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">Web Developer</span>
          ,{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">Graphic Designer</span>
          ,{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">Content Writer</span>
        </p>
      </div>
    </section>
  );
};

export default Hero;

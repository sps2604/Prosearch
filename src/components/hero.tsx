"use client";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-snug">
          Search for Verified & Skilled Professionals Near You
        </h1>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 w-full max-w-4xl mx-auto bg-white border border-gray-200 shadow-md rounded-2xl md:rounded-full px-4 py-4 hover:shadow-lg transition">
          {/* Profession Input */}
          <input
            type="text"
            placeholder="What professional do you need?"
            className="flex-grow px-4 py-3 text-base md:text-lg text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none border-b md:border-b-0 md:border-r border-gray-200"
          />

          {/* Location Dropdown */}
          <select className="px-4 py-3 text-base md:text-lg text-gray-700 bg-transparent focus:outline-none border-b md:border-b-0 md:border-r border-gray-200">
            <option value="">Select Location</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="pune">Pune</option>
          </select>

          {/* Experience Dropdown */}
          <select className="px-4 py-3 text-base md:text-lg text-gray-700 bg-transparent focus:outline-none border-b md:border-b-0 md:border-r border-gray-200">
            <option value="">Select Experience</option>
            <option value="fresher">Fresher</option>
            <option value="1-3">1 - 3 Years</option>
            <option value="3-5">3 - 5 Years</option>
            <option value="5+">5+ Years</option>
          </select>

          {/* Search Button */}
          <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg md:rounded-full transition">
            Search
          </button>
        </div>

        {/* Popular Searches */}
        <p className="mt-6 text-gray-500 text-sm md:text-base">
          Popular searches:{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Web Developer
          </span>
          ,{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Graphic Designer
          </span>
          ,{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Content Writer
          </span>
        </p>
      </div>
    </section>
  );
};

export default Hero;

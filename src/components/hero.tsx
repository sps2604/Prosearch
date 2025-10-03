"use client";
import React, { useState } from "react";
import SearchBar from "./search_bar";
import { Search, MapPin } from "lucide-react";
import Logo2 from "../assets/logo2.png";

const Hero: React.FC = () => {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const popular = ["Web Developer", "Graphic Designer", "Content Writer"];

  const triggerKey = searchTrigger; // increments only on Search/Enter

  const handlePopularClick = (text: string) => {
    // Fill input only; user can press Search to execute
    setProfession(text);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTrigger((t) => t + 1);
    }
  };

  const handleSearchClick = () => {
    setSearchTrigger((t) => t + 1);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Heading */}
          <img src={Logo2} alt="Professional Search" className="h-32 md:h-40 mx-auto mb-4" />
          <p className="text-lg md:text-xl text-gray-700 font-bold mb-8">
            Search for Verified & Skilled Professionals Near You
          </p>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center w-full max-w-2xl mx-auto border border-gray-300 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-white">
            {/* Profession Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Search Professionals/Businesses"
                className="w-full pl-12 pr-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none rounded-l-full"
              />
            </div>

            {/* Location free-text with suggestions */}
            <div className="relative flex-grow-0 border-l border-gray-200">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                list="city-suggestions"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Enter Location"
                className="w-full pl-12 pr-4 py-3 text-base text-gray-700 bg-transparent focus:outline-none rounded-r-full"
              />
              <datalist id="city-suggestions">
                <option value="Mumbai" />
                <option value="Delhi" />
                <option value="Bangalore" />
                <option value="Pune" />
              </datalist>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Search
            </button>
          </div>

          {/* Results list below input using SearchBar component */}
          <div className="mt-3 max-w-4xl mx-auto">
            <SearchBar
              initialQuery={profession}
              locationText={location}
              minExperience={null}
              forceSearchKey={triggerKey}
              placeholder="Search professionals (e.g., Designer, Plumber, Pune)"
              renderInput={false}
              autoSearchOnChange={false}
            />
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-gray-700 text-sm md:text-base">Popular searches:</span>
            {popular.map((item) => (
              <span
                key={item}
                onClick={() => handlePopularClick(item)}
                className="bg-white px-3 py-1 rounded-full border border-gray-300 text-blue-600 text-sm md:text-base cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10">
            How Professional Search Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Search for Professionals</h3>
              <p className="text-gray-600">Easily find verified and skilled professionals by profession or location.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">View Profiles & Reviews</h3>
              <p className="text-gray-600">Browse detailed professional profiles, portfolios, and customer reviews.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center p-6 bg-yellow-50 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect & Hire</h3>
              <p className="text-gray-600">Contact your chosen professional directly and hire them for your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10">
            Why Choose Professional Search?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 text-white text-2xl font-bold mb-4">
                ⭐
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Verified Professionals</h3>
              <p className="text-gray-600">All professionals are thoroughly vetted for skills and background checks.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white text-2xl font-bold mb-4">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure & Transparent</h3>
              <p className="text-gray-600">Enjoy secure transactions and transparent communication with professionals.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-500 text-white text-2xl font-bold mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quick & Easy Hiring</h3>
              <p className="text-gray-600">Find and hire the right professional for your job in minutes, not days.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
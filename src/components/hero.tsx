"use client";
import React, { useMemo, useState } from "react";
import SearchBar from "./search_bar";

const Hero: React.FC = () => {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState<string>("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const minExperience = useMemo(() => {
    if (!experience) return null;
    if (experience === "fresher") return 0;
    if (experience === "1-3") return 1;
    if (experience === "3-5") return 3;
    if (experience === "5+") return 5;
    const parsed = Number(experience);
    return Number.isFinite(parsed) ? parsed : null;
  }, [experience]);

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
    <section className="bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-snug">
          Search for Verified & Skilled Professionals Near You
        </h1>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 w-full max-w-4xl mx-auto">
          {/* Unified search with filters */}
          <div className="flex-1 bg-white border border-gray-200 shadow-md rounded-2xl md:rounded-full px-4 py-4 hover:shadow-lg transition">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Profession Input */}
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="What professional do you need?"
                className="flex-grow px-4 py-3 text-base md:text-lg text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none border-b md:border-b-0 md:border-r border-gray-200"
              />

              {/* Location free-text with suggestions */}
              <input
                list="city-suggestions"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Select Location or type to add"
                className="px-4 py-3 text-base md:text-lg text-gray-700 bg-transparent focus:outline-none border-b md:border-b-0 md:border-r border-gray-200"
              />
              <datalist id="city-suggestions">
                <option value="Mumbai" />
                <option value="Delhi" />
                <option value="Bangalore" />
                <option value="Pune" />
              </datalist>

              {/* Experience Dropdown */}
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="px-4 py-3 text-base md:text-lg text-gray-700 bg-transparent focus:outline-none border-b md:border-b-0 md:border-r border-gray-200"
              >
                <option value="">Select Experience</option>
                <option value="fresher">Fresher</option>
                <option value="1-3">1 - 3 Years</option>
                <option value="3-5">3 - 5 Years</option>
                <option value="5+">5+ Years</option>
              </select>

              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg md:rounded-full transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Hidden button replaced by integrated search component */}
        </div>

        {/* Results list below input using SearchBar component */}
        <div className="mt-3 max-w-4xl mx-auto">
          <SearchBar
            initialQuery={profession}
            locationText={location}
            minExperience={minExperience}
            forceSearchKey={triggerKey}
            placeholder="Search professionals (e.g., Designer, Plumber, Pune)"
            renderInput={false}
            autoSearchOnChange={false}
          />
        </div>

        {/* Popular Searches */}
        <p className="mt-6 text-gray-500 text-sm md:text-base">
          Popular searches:{" "}
          {popular.map((item, idx) => (
            <>
              <span
                key={item}
                onClick={() => handlePopularClick(item)}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                {item}
              </span>
              {idx < popular.length - 1 ? ", " : ""}
            </>
          ))}
        </p>
      </div>
    </section>
  );
};

export default Hero;

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const jobTypesList = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

// ✅ ADDED: Hardcoded list of locations for the dropdown
const locationsList = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Remote"
];

interface FilterSidebarProps {
  salaryRange: {
    min: number;
    max: number;
  };
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ salaryRange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(
    searchParams.get('job_types')?.split(',').filter(Boolean) || []
  );
  // ✅ ADDED: State for location filter
  const [selectedLocation, setSelectedLocation] = useState<string>(
    searchParams.get('location') || ""
  );

  // State for salary slider
  const [minSalary, setMinSalary] = useState<number>(
    parseInt(searchParams.get("min_salary") || salaryRange.min.toString(), 10)
  );

  // ✅ CONSOLIDATED: Update all filter states when URL or salaryRange prop changes
  useEffect(() => {
    setSelectedJobTypes(searchParams.get('job_types')?.split(',').filter(Boolean) || []);
    setSelectedLocation(searchParams.get('location') || "");
    const currentMinSalary = parseInt(searchParams.get("min_salary") || salaryRange.min.toString(), 10);
    setMinSalary(currentMinSalary);
  }, [salaryRange, searchParams]);

  // Handle job type checkbox changes
  const handleJobTypeChange = (jobType: string) => {
    const newJobTypes = selectedJobTypes.includes(jobType)
      ? selectedJobTypes.filter((type) => type !== jobType)
      : [...selectedJobTypes, jobType];
    
    setSelectedJobTypes(newJobTypes);
    
    const params = new URLSearchParams(searchParams);
    if (newJobTypes.length > 0) {
      params.set("job_types", newJobTypes.join(","));
    } else {
      params.delete("job_types");
    }
    setSearchParams(params);
  };

  // ✅ ADDED: Handle location dropdown changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLocation(value);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("location", value);
    } else {
      params.delete("location");
    }
    setSearchParams(params);
  };
  // Handle salary slider changes
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMinSalary(value);

    const params = new URLSearchParams(searchParams);
    // Only set the param if it's not the minimum value, to keep the URL clean
    if (value > salaryRange.min) {
      params.set("min_salary", value.toString());
    } else {
      params.delete("min_salary");
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Job Type */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Job Type</h3>
        <div className="space-y-2">
          {jobTypesList.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={type}
                checked={selectedJobTypes.includes(type)}
                onChange={() => handleJobTypeChange(type)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ✅ ADDED: Location Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Location</h3>
        <select
          value={selectedLocation}
          aria-label="Filter by location"
          onChange={handleLocationChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Locations</option>
          {locationsList.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>


      {/* Salary Range Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Minimum Salary Expected</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={salaryRange.min}
            max={salaryRange.max}
            value={minSalary}
            onChange={handleSalaryChange}
            step={5000} // Adjust step as needed
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{salaryRange.min.toLocaleString()}</span>
            <span className="font-medium text-blue-600">
              ₹{minSalary.toLocaleString()}+
            </span>
            <span>₹{salaryRange.max.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;

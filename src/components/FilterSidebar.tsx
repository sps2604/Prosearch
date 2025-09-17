import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function FilterSidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize filters from URL params
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(
    searchParams.get('job_types')?.split(',').filter(Boolean) || []
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get('location') || ""
  );
  const [payRange, setPayRange] = useState([
    0, 
    Number(searchParams.get('max_salary')) || 100000
  ]);

  // Match your database job_type values
  const jobTypes = [
    { label: "Full Time", value: "Full-time" },
    { label: "Part Time", value: "Part-time" },
    { label: "Freelance", value: "Freelance" },
    { label: "Internship", value: "Internship" },
    { label: "Remote", value: "Remote" }
  ];
  
  const locations = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", 
    "Chennai", "Kolkata", "Ahmedabad", "Remote", "Work from Home"
  ];

  const toggleJobType = (value: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Preserve existing search/category if present
    const currentSearch = searchParams.get('search');
    const currentCategory = searchParams.get('category');
    
    if (currentSearch) params.set('search', currentSearch);
    if (currentCategory) params.set('category', currentCategory);
    
    // Add filter params
    if (selectedJobTypes.length > 0) {
      params.set('job_types', selectedJobTypes.join(','));
    }
    if (selectedLocation) {
      params.set('location', selectedLocation);
    }
    if (payRange[1] < 100000) {
      params.set('max_salary', payRange[1].toString());
    }
    
    navigate(`/browse-job?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedJobTypes([]);
    setSelectedLocation("");
    setPayRange([0, 100000]);
    
    // Keep only search/category params
    const params = new URLSearchParams();
    const currentSearch = searchParams.get('search');
    const currentCategory = searchParams.get('category');
    
    if (currentSearch) params.set('search', currentSearch);
    if (currentCategory) params.set('category', currentCategory);
    
    navigate(`/browse-job${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      {/* Job Type */}
      <div>
        <h3 className="font-medium mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedJobTypes.includes(type.value)}
                onChange={() => toggleJobType(type.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="font-medium mb-3">Location</h3>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Locations</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Pay Range */}
      <div>
        <h3 className="font-medium mb-3">Maximum Salary</h3>
        <input
          type="range"
          min="0"
          max="100000"
          step="5000"
          value={payRange[1]}
          onChange={(e) => setPayRange([0, Number(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>₹0</span>
          <span>₹{payRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button 
          onClick={applyFilters}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
        
        {/* Filter count indicator */}
        {(selectedJobTypes.length > 0 || selectedLocation || payRange[1] < 100000) && (
          <div className="text-center text-sm text-gray-600">
            {selectedJobTypes.length + (selectedLocation ? 1 : 0) + (payRange[1] < 100000 ? 1 : 0)} filter(s) active
          </div>
        )}
      </div>
    </div>
  );
}
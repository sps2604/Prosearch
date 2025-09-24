import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Filter, X } from "lucide-react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import JobCard, { type JobPost } from "../components/JobCard";
import MatchingJobsSection from "../components/MatchingJobsSection";
import FilterSidebar from "../components/FilterSidebar";

// ✅ Category data with image imports
import graphicDesignerImg from "../assets/graphic_designer.jpg";
import digitalMarketingImg from "../assets/digital_marketing.png";
import telecallersImg from "../assets/telecallers.png";
import videoEditorsImg from "../assets/video_editors.png";
import javaDevelopersImg from "../assets/java_developers.png";
import internImg from "../assets/intern.png";
import dataEntryImg from "../assets/data_entry.png";
import remoteWorkersImg from "../assets/remote_workers.png";

// ✅ Job categories with images
const jobCategories = [
  { name: "Graphics Designer", image: graphicDesignerImg, searchTerm: "Graphics Designer" },
  { name: "Digital Marketing", image: digitalMarketingImg, searchTerm: "Digital Marketing" },
  { name: "Telecallers", image: telecallersImg, searchTerm: "Telecaller" },
  { name: "Video Editors", image: videoEditorsImg, searchTerm: "Video Editor" },
  { name: "Java Developers", image: javaDevelopersImg, searchTerm: "Java Developer" },
  { name: "Interns", image: internImg, searchTerm: "Intern" },
  { name: "Data Entry", image: dataEntryImg, searchTerm: "Data Entry" },
  { name: "Remote Workers", image: remoteWorkersImg, searchTerm: "Remote" },
];

export default function FindAJob() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("Job_Posts")
        .select("*, company_name, deadline", { count: "exact" }) // ✅ MERGED: Include both fields and count
        .order("created_at", { ascending: false });

      // Apply filters from URL params
      const search = searchParams.get("search");
      const location = searchParams.get("location");
      const jobTypes = searchParams.get("job_types")?.split(",").filter(Boolean);
      const maxSalary = searchParams.get("max_salary");
      const category = searchParams.get("category");

      // Apply search filter
      if (search) {
        query = query.or(`profession.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply location filter
      if (location) {
        query = query.ilike("location", `%${location}%`);
      }

      // Apply category filter
      if (category) {
        query = query.ilike("profession", `%${category}%`);
      }

      // Apply job types filter
      if (jobTypes && jobTypes.length > 0) {
        const jobTypeFilter = jobTypes.map(type => `job_type.cs.{"${type}"}`).join(",");
        query = query.or(jobTypeFilter);
      }

      // ✅ MERGED: Salary filter handling (can be enhanced based on your salary field structure)
      if (maxSalary) {
        // For salary filtering, you might need to add salary parsing logic
        // This depends on how your salary field is structured
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setJobs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category click
  const handleCategoryClick = (category: typeof jobCategories[0]) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", category.searchTerm);
    params.set("search", category.searchTerm);
    setSearchParams(params);
    setSearchTerm(category.searchTerm);
  };

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    if (selectedLocation) {
      params.set("location", selectedLocation);
    } else {
      params.delete("location");
    }
    setSearchParams(params);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const jobTypes = searchParams.get("job_types")?.split(",").filter(Boolean);
    const maxSalary = searchParams.get("max_salary");
    const category = searchParams.get("category");

    if (search) filters.push({ type: "search", value: search, label: `"${search}"` });
    if (location) filters.push({ type: "location", value: location, label: `📍 ${location}` });
    if (category && category !== search) filters.push({ type: "category", value: category, label: `🏷️ ${category}` });
    if (jobTypes && jobTypes.length > 0) {
      jobTypes.forEach(type => filters.push({ type: "job_type", value: type, label: `💼 ${type}` }));
    }
    if (maxSalary) filters.push({ type: "salary", value: maxSalary, label: `💰 Up to ₹${parseInt(maxSalary).toLocaleString()}` });

    return filters;
  };

  // Remove specific filter
  const removeFilter = (filterType: string, filterValue?: string) => {
    const params = new URLSearchParams(searchParams);
    
    switch (filterType) {
      case "search":
        params.delete("search");
        setSearchTerm("");
        break;
      case "location":
        params.delete("location");
        setSelectedLocation("");
        break;
      case "category":
        params.delete("category");
        break;
      case "job_type":
        const jobTypes = params.get("job_types")?.split(",").filter(Boolean) || [];
        const updatedJobTypes = jobTypes.filter(type => type !== filterValue);
        if (updatedJobTypes.length > 0) {
          params.set("job_types", updatedJobTypes.join(","));
        } else {
          params.delete("job_types");
        }
        break;
      case "salary":
        params.delete("max_salary");
        break;
    }
    
    setSearchParams(params);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchTerm("");
    setSelectedLocation("");
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AfterLoginNavbar />
      
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <FilterSidebar />
        </div>
      </div>
      
      {/* ✅ MERGED: Enhanced Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Jobs ⚡ Fast
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ✨ Instantly! Discover opportunities that match your skills and ambitions
            </p>
          </div>

          {/* ✅ Search Bar (Enhanced) */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="relative md:col-span-5">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Job title, skills, or company"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="relative md:col-span-4">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors relative"
                  >
                    <Filter size={20} />
                    {activeFilters.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filter.type, filter.value)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Browse by Category Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600">Explore jobs across different industries and roles</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {jobCategories.map((category, index) => (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg hover:border-blue-300 transition-all duration-200 group-hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ MERGED: Load More Button for Categories */}
            <div className="text-center mt-8">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-full transition-colors font-medium">
                Load More Categories
              </button>
            </div>
          </section>

          {/* Matching Jobs Section */}
          <section className="mb-12">
            <MatchingJobsSection />
          </section>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeFilters.length > 0 ? "Filtered Results" : "Latest Jobs"}
              </h2>
              <p className="text-gray-600 mt-1">
                {loading ? "Loading jobs..." : `Showing ${jobs.length} of ${totalCount} jobs`}
              </p>
            </div>
            
            {/* ✅ MERGED: Sort Options */}
            <div className="mt-4 sm:mt-0">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option>Most Recent</option>
                <option>Most Relevant</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => {
                    console.log("Job clicked:", job.id);
                  }}
                />
              ))}
            </div>
          )}

          {/* ✅ MERGED: Load More Button for Jobs */}
          {!loading && jobs.length > 0 && jobs.length < totalCount && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Load More Jobs
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

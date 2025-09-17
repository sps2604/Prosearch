import  { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";

interface Job {
  id: number;
  profession: string;
  description: string;
  location: string;
  salary: string;
  experience: string | null;
  job_type: string[];
  created_at: string;
  company_id: number;
}

interface Company {
  id: number;
  name: string;
  email: string;
  contact: string;
  website: string;
}

export default function BrowseJob() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<{ [key: number]: Company }>({});
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Set search term from URL query params
  useEffect(() => {
    const searchQuery = searchParams.get("search") || "";
    const categoryQuery = searchParams.get("category") || "";

    if (searchQuery) setSearch(searchQuery);
    else if (categoryQuery) setSearch(categoryQuery);
  }, [searchParams]);

  // ULTRA FAST - Separate queries for better performance
  const fetchJobs = async () => {
    setLoading(true);
    console.log("🚀 Fast fetch starting...");

    try {
      // Get filter parameters
      const searchQuery = searchParams.get("search") || search;
      const categoryQuery = searchParams.get("category") || "";
      const jobTypes = searchParams.get("job_types")?.split(",").filter(Boolean) || [];
      const locationFilter = searchParams.get("location") || "";

      // STEP 1: Fast job query without joins
      let jobQuery = supabase
        .from("Job_Posts")
        .select("id, profession, description, location, salary, experience, job_type, created_at, company_id")
        .order("created_at", { ascending: false })
        .limit(15);

      // Apply only the most important filters
      if (searchQuery.trim()) {
        jobQuery = jobQuery.ilike("profession", `%${searchQuery}%`);
      } else if (categoryQuery.trim()) {
        jobQuery = jobQuery.ilike("profession", `%${categoryQuery}%`);
      }

      if (locationFilter.trim()) {
        jobQuery = jobQuery.ilike("location", `%${locationFilter}%`);
      }

      // Simple job type filter
      if (jobTypes.length === 1) {
        jobQuery = jobQuery.contains('job_type', [jobTypes[0]]);
      }

      console.log("🔄 Fetching jobs...");
      const { data: jobData, error: jobError } = await jobQuery;

      if (jobError) {
        console.error("❌ Job fetch error:", jobError);
        throw jobError;
      }

      console.log("✅ Jobs fetched:", jobData?.length || 0);

      if (!jobData || jobData.length === 0) {
        setJobs([]);
        setCompanies({});
        setTotalCount(0);
        setLoading(false);
        return;
      }

      // STEP 2: Fast company query for only needed companies
      const companyIds = [...new Set(jobData.map(job => job.company_id).filter(Boolean))];
      
      if (companyIds.length > 0) {
        console.log("🔄 Fetching companies for:", companyIds.length, "companies");
        const { data: companyData, error: companyError } = await supabase
          .from("Companies")
          .select("id, name, email, contact, website")
          .in("id", companyIds);

        if (companyError) {
          console.warn("⚠️ Company fetch error:", companyError);
        }

        // Create company lookup map
        const companyMap: { [key: number]: Company } = {};
        (companyData || []).forEach(company => {
          companyMap[company.id] = company;
        });
        setCompanies(companyMap);
        console.log("✅ Companies fetched:", Object.keys(companyMap).length);
      }

      setJobs(jobData);
      setTotalCount(jobData.length);

    } catch (error) {
      console.error("❌ Fetch error:", error);
      
      // ✅ FIXED: Ultra-simple fallback with ALL required fields
      try {
        console.log("🔄 Trying simple fallback...");
        const { data: fallbackData } = await supabase
          .from("Job_Posts")
          .select("id, profession, description, location, salary, experience, job_type, created_at, company_id")
          .order("created_at", { ascending: false })
          .limit(10);

        setJobs(fallbackData || []);
        setTotalCount(fallbackData?.length || 0);
        console.log("✅ Fallback loaded:", fallbackData?.length || 0);
        
      } catch (fallbackError) {
        console.error("❌ Fallback failed:", fallbackError);
        setJobs([]);
        setTotalCount(0);
      }
    }

    setLoading(false);
  };

  // Fast fetch with minimal delay
  useEffect(() => {
    const timer = setTimeout(fetchJobs, 200);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Debounce manual search
  useEffect(() => {
    if (search && !searchParams.get("search")) {
      const timeout = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        params.set("search", search);
        window.history.pushState({}, "", `${window.location.pathname}?${params}`);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [search]);

  const handleSearch = () => {
    const q = search.trim();
    if (!q) return;
    navigate(`/browse-job?search=${encodeURIComponent(q)}`);
  };

  // ✅ REMOVED: Unused handleKeyPress function

  const getCompanyName = (companyId: number) => {
    return companies[companyId]?.name || "Company Name N/A";
  };

  const getCompanyInfo = (companyId: number) => {
    return companies[companyId] || null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const getActiveFiltersText = () => {
    const filters = [];
    const searchQuery = searchParams.get("search");
    const category = searchParams.get("category");
    const jobTypes = searchParams.get("job_types")?.split(",").filter(Boolean) || [];
    const location = searchParams.get("location");

    if (searchQuery) filters.push(`"${searchQuery}"`);
    if (category) filters.push(`${category}`);
    if (jobTypes.length > 0) filters.push(jobTypes.join(", "));
    if (location) filters.push(location);

    return filters.length > 0 ? filters.join(" • ") : "All Jobs";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AfterLoginNavbar />

      <div className="flex flex-1 bg-gray-50">
        {/* Sidebar */}
        <aside className="w-1/4 p-4 border-r bg-white shadow-sm">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Find Jobs ⚡ Fast
            </h1>
            <p className="text-lg text-gray-600 mb-4">✨ Instantly!</p>

            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-white shadow-lg rounded-lg px-4 py-3 max-w-2xl mb-4">
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                className="flex-1 outline-none px-2 text-gray-700"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>

            {/* Category Grid */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Browse by Category</h2>
              <p className="text-center text-gray-600 mb-6">Find the perfect talent for your project</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl">
                {[
                  'Graphics Designer',
                  'Digital Marketing',
                  'Telecallers',
                  'Video Editors',
                  'Java Developers',
                  'Interns',
                  'Data Entry',
                  'Remote Workers'
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => navigate(`/browse-job?category=${encodeURIComponent(cat)}`)}
                    className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 text-center border border-gray-100"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3 border"/>
                    <div className="font-medium text-gray-800">{cat}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {getActiveFiltersText()}
                </h2>
                <p className="text-gray-600">
                  {loading ? "Loading..." : `${totalCount} jobs found`}
                </p>
              </div>
            </div>
          </div>

          {/* Job Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
                <button
                  onClick={() => {
                    setSearch("");
                    window.history.pushState({}, "", "/browse-job");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Show All Jobs
                </button>
              </div>
            ) : (
              jobs.map((job) => {
                const company = getCompanyInfo(job.company_id);
                return (
                  <div
                    key={job.id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {job.profession}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <span className="font-medium">{getCompanyName(job.company_id)}</span>
                          <span className="mx-2">•</span>
                          <span>{job.location}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(job.created_at)}</span>
                        </div>
                        
                        {/* ✅ ADDED: Display job description if available */}
                        {job.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {job.description.length > 100 
                              ? `${job.description.substring(0, 100)}...` 
                              : job.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-sm">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            💰 {job.salary}
                          </span>
                          {job.experience && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              🎯 {job.experience}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex flex-wrap gap-1">
                          {job.job_type?.slice(0, 2).map((type, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                            Details
                          </button>
                          <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>

                    {company && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                        {company.email && <span>📧 {company.email}</span>}
                        {company.contact && <span>📱 {company.contact}</span>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PopularSearches() {
  const navigate = useNavigate();
  const [popularTerms, setPopularTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        // Get most common professions from user_profiles
        const { data: professions } = await supabase
          .from("user_profiles")
          .select("profession")
          .not("profession", "is", null)
          .not("profession", "eq", "");

        // Get most common job titles from Jobs
        const { data: jobs } = await supabase
          .from("Jobs")
          .select("profession")
          .not("profession", "is", null)
          .not("profession", "eq", "");

        // Combine and count occurrences
        const allTerms = [
          ...(professions?.map(p => p.profession) || []),
          ...(jobs?.map(j => j.profession) || [])
        ];

        const termCounts: { [key: string]: number } = {};
        allTerms.forEach(term => {
          const cleanTerm = term.toLowerCase().trim();
          termCounts[cleanTerm] = (termCounts[cleanTerm] || 0) + 1;
        });

        // Get top 8 most popular terms
        const popular = Object.entries(termCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([term]) => term);

        // If no data, use fallback terms
        const fallbackTerms = [
          "Software Developer", "Web Developer", "Data Scientist", "UI/UX Designer",
          "Marketing Manager", "Sales Executive", "Graphic Designer", "Business Analyst"
        ];

        setPopularTerms(popular.length > 0 ? popular : fallbackTerms);
      } catch (error) {
        console.error("Error fetching popular searches:", error);
        // Fallback terms
        setPopularTerms([
          "Software Developer", "Web Developer", "Data Scientist", "UI/UX Designer",
          "Marketing Manager", "Sales Executive", "Graphic Designer", "Business Analyst"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSearches();
  }, []);

  const handleSearchClick = (term: string) => {
    // Navigate to FindAJob with search term
    navigate(`/find-job?search=${encodeURIComponent(term)}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Searches
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Discover what others are looking for
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-12 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularTerms.map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(term)}
                className="flex items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                <span className="text-gray-700 group-hover:text-blue-600 font-medium capitalize">
                  {term}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/find-job")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            Browse All Jobs
          </button>
        </div>
      </div>
    </section>
  );
}

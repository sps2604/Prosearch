import React, { useState, useEffect } from "react";
import { Code, Palette, TrendingUp, Briefcase, Wrench, Heart, ArrowRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface Domain {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  jobCount: number;
  professionalCount: number;
  keywords: string[];
}

export default function Domains() {
  const navigate = useNavigate();
  const [domainStats, setDomainStats] = useState<{ [key: string]: { jobs: number; professionals: number } }>({});
  const [loading, setLoading] = useState(true);

  const domains: Domain[] = [
    {
      id: "technology",
      name: "Technology",
      icon: Code,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Software development, IT, and tech roles",
      jobCount: 0,
      professionalCount: 0,
      keywords: ["developer", "software", "programmer", "engineer", "tech", "it", "coding", "web", "mobile", "frontend", "backend", "fullstack"]
    },
    {
      id: "design",
      name: "Design & Creative",
      icon: Palette,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "UI/UX design, graphics, and creative work",
      jobCount: 0,
      professionalCount: 0,
      keywords: ["design", "designer", "creative", "ui", "ux", "graphic", "artist", "illustrator", "visual", "brand"]
    },
    {
      id: "marketing",
      name: "Marketing & Sales",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Marketing, sales, and growth roles",
      jobCount: 0,
      professionalCount: 0,
      keywords: ["marketing", "sales", "digital marketing", "seo", "content", "social media", "advertising", "growth", "brand", "campaign"]
    },
    {
      id: "business",
      name: "Business & Finance",
      icon: Briefcase,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Business analysis, finance, and consulting",
      jobCount: 0,
      professionalCount: 0,
      keywords: ["business", "finance", "analyst", "consultant", "accounting", "manager", "operations", "strategy", "project", "admin"]
    },
    {
      id: "engineering",
      name: "Engineering",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Mechanical, civil, and other engineering",
      jobCount: 0,
      professionalCount: 0,
      keywords: ["engineer", "engineering", "mechanical", "civil", "electrical", "construction", "manufacturing", "technical", "industrial"]
    },
    {
      id: "healthcare",
      name: "Healthcare",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Medical, healthcare, and wellness roles",
      jobCount: 0,
      professionalCount: 0,
      keywords: ["healthcare", "medical", "doctor", "nurse", "health", "wellness", "therapy", "clinical", "pharmaceutical"]
    }
  ];

  useEffect(() => {
    const fetchDomainStats = async () => {
      try {
        // Fetch all jobs and professionals
        const [jobsData, professionalsData] = await Promise.all([
          supabase.from("Jobs").select("profession"),
          supabase.from("user_profiles").select("profession").eq("user_type", "professional")
        ]);

        const stats: { [key: string]: { jobs: number; professionals: number } } = {};

        // Initialize stats
        domains.forEach(domain => {
          stats[domain.id] = { jobs: 0, professionals: 0 };
        });

        // Count jobs by domain
        jobsData.data?.forEach(job => {
          if (job.profession) {
            const profession = job.profession.toLowerCase();
            domains.forEach(domain => {
              if (domain.keywords.some(keyword => profession.includes(keyword.toLowerCase()))) {
                stats[domain.id].jobs++;
              }
            });
          }
        });

        // Count professionals by domain
        professionalsData.data?.forEach(professional => {
          if (professional.profession) {
            const profession = professional.profession.toLowerCase();
            domains.forEach(domain => {
              if (domain.keywords.some(keyword => profession.includes(keyword.toLowerCase()))) {
                stats[domain.id].professionals++;
              }
            });
          }
        });

        setDomainStats(stats);
      } catch (error) {
        console.error("Error fetching domain stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDomainStats();
  }, []);

  // ✅ UPDATED: Smart domain click that goes to find-job with search
  const handleDomainClick = (domain: Domain) => {
    // Use the most popular keyword from the domain
    const searchTerm = domain.keywords[0];
    navigate(`/find-job?search=${encodeURIComponent(searchTerm)}&domain=${domain.id}`);
  };

  // ✅ UPDATED: View Jobs button - goes to find-job with domain filter
  const handleViewJobs = (domain: Domain, e: React.MouseEvent) => {
    e.stopPropagation();
    const searchTerms = domain.keywords.slice(0, 2).join(" OR "); // Use top 2 keywords
    navigate(`/find-job?search=${encodeURIComponent(searchTerms)}&domain=${domain.id}`);
  };

  // ✅ UPDATED: View Professionals button - goes to find-job with different search
  const handleViewProfessionals = (domain: Domain, e: React.MouseEvent) => {
    e.stopPropagation();
    // Search for professionals in this domain (you can modify this based on your needs)
    navigate(`/find-job?search=${encodeURIComponent(domain.name + " professional")}&type=professional`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Filter className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Domains
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Explore opportunities across different industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {domains.map((domain) => {
            const stats = domainStats[domain.id] || { jobs: 0, professionals: 0 };
            return (
              <div
                key={domain.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => handleDomainClick(domain)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${domain.bgColor}`}>
                      <domain.icon className={`w-6 h-6 ${domain.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {domain.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {domain.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-8 mx-auto rounded"></div>
                        ) : (
                          stats.jobs
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Jobs Available</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-8 mx-auto rounded"></div>
                        ) : (
                          stats.professionals
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Professionals</div>
                    </div>
                  </div>

                  {/* Popular Keywords */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Popular Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {domain.keywords.slice(0, 4).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ✅ UPDATED: Action Buttons with proper navigation */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleViewJobs(domain, e)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${domain.bgColor} ${domain.color} hover:opacity-80`}
                    >
                      <span>View Jobs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleViewProfessionals(domain, e)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <span>Find Talent</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ UPDATED: View All Button goes to find-job */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/find-job")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Browse All Jobs</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

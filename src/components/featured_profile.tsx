import { useState, useEffect } from "react";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface FeaturedProfile {
  id: string;
  name: string;
  profession: string;
  experience: number;
  location: string;
  skills: string;
  logo_url: string;
  summary: string;
  address: string; // ✅ ADDED: Missing address property
}

export default function FeaturedProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_type", "professional")
          .not("profession", "is", null)
          .not("profession", "eq", "")
          .not("name", "is", null)
          .not("name", "eq", "")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        setProfiles(data || []);
      } catch (error) {
        console.error("Error fetching featured profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProfiles();
  }, []);

  const handleViewProfile = (profileId: string) => {
    // Navigate to public profile view
    navigate(`/profile/${profileId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSkillsArray = (skills: string) => {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Professionals
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Discover talented professionals ready for your next project
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64"></div>
              </div>
            ))}
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {profile.logo_url ? (
                        <img
                          src={profile.logo_url}
                          alt={profile.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-100">
                          <span className="text-blue-600 font-semibold text-lg">
                            {getInitials(profile.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {profile.name}
                      </h3>
                      <p className="text-blue-600 font-medium mb-2">
                        {profile.profession}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{profile.experience || 0}+ years</span>
                        </div>
                        {profile.address && ( // ✅ FIXED: Now properly typed
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{profile.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {profile.summary && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {profile.summary}
                    </p>
                  )}

                  {/* Skills */}
                  {profile.skills && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getSkillsArray(profile.skills).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Profile Button */}
                  <button
                    onClick={() => handleViewProfile(profile.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group-hover:bg-blue-100"
                  >
                    <span className="font-medium">View Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Featured Profiles Yet
            </h3>
            <p className="text-gray-600">
              Professional profiles will appear here as they join the platform.
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/professionals")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Browse All Professionals</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

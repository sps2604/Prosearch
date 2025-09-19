import { MapPin, Clock } from "lucide-react";
import type { ProfessionalSummary } from "./search_bar"; // ✅ FIXED: Use type-only import

interface SearchResultCardProps {
  profile: ProfessionalSummary;
  onClick: () => void;
}

export default function SearchResultCard({ profile, onClick }: SearchResultCardProps) {
  const experienceText = profile.experience 
    ? `${profile.experience} year${profile.experience > 1 ? 's' : ''} exp`
    : 'New';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 flex-shrink-0 w-64 sm:w-72"
    >
      {/* Card Content */}
      <div className="p-4">
        {/* Header - Avatar & Name */}
        <div className="flex items-center gap-3 mb-3">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {profile.name?.[0]?.toUpperCase() || "P"}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {profile.name}
            </h3>
            <p className="text-blue-600 text-xs font-medium truncate">
              {profile.profession}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {/* Experience */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock size={12} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{experienceText}</span>
          </div>

          {/* Location */}
          {profile.address && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile.address}</span>
            </div>
          )}

          {/* Skills - First 2 skills */}
          {profile.skills && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.skills
                .split(',')
                .slice(0, 2)
                .map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full truncate max-w-20"
                  >
                    {skill.trim()}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors">
            View Profile →
          </button>
        </div>
      </div>
    </div>
  );
}

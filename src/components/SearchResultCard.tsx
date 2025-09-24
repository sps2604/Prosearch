import { MapPin, Clock, Building2, Briefcase, ArrowRight, Star } from "lucide-react";
import type { ProfessionalSummary } from "./search_bar";

interface SearchResultCardProps {
  profile: ProfessionalSummary;
  onClick: () => void;
}

export default function SearchResultCard({ profile, onClick }: SearchResultCardProps) {
  const isBusiness = profile.type === "business";
  const isCompany = profile.type === "company";
  const isProfessional = !isBusiness && !isCompany;
  
  const experienceText = profile.experience 
    ? `${profile.experience} year${profile.experience > 1 ? 's' : ''} exp`
    : isProfessional ? 'New' : '';

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get type-specific styling
  const getTypeConfig = () => {
    if (isBusiness) {
      return {
        icon: Building2,
        bgGradient: "from-orange-400 to-orange-600",
        borderColor: "hover:border-orange-300",
        textColor: "text-orange-600",
        bgColor: "bg-orange-50",
        label: "Business"
      };
    }
    if (isCompany) {
      return {
        icon: Briefcase,
        bgGradient: "from-purple-400 to-purple-600",
        borderColor: "hover:border-purple-300",
        textColor: "text-purple-600",
        bgColor: "bg-purple-50",
        label: "Company"
      };
    }
    return {
      icon: Star,
      bgGradient: "from-blue-400 to-blue-600",
      borderColor: "hover:border-blue-300",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      label: "Professional"
    };
  };

  const typeConfig = getTypeConfig();
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 ${typeConfig.borderColor} flex-shrink-0 w-64 sm:w-72 group`}
    >
      {/* Card Content */}
      <div className="p-6">
        {/* Header - Avatar & Name */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="relative">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${typeConfig.bgGradient} flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
                {getInitials(profile.name || "P")}
              </div>
            )}
            
            {/* Type Badge */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${typeConfig.bgColor} rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
              <TypeIcon size={12} className={typeConfig.textColor} />
            </div>
          </div>
          
          {/* Name & Profession */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base truncate mb-1 group-hover:text-blue-600 transition-colors">
              {profile.name}
            </h3>
            <p className={`text-sm font-medium truncate flex items-center gap-1.5 ${typeConfig.textColor}`}>
              <TypeIcon size={14} />
              {profile.profession}
            </p>
            
            {/* Type Label */}
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-3">
          {/* Experience (Professionals only) */}
          {isProfessional && experienceText && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="p-1 bg-gray-100 rounded-md">
                <Clock size={14} className="text-gray-500" />
              </div>
              <span>{experienceText}</span>
            </div>
          )}

          {/* Location */}
          {profile.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="p-1 bg-gray-100 rounded-md">
                <MapPin size={14} className="text-gray-500" />
              </div>
              <span className="truncate">{profile.address}</span>
            </div>
          )}

          {/* Industry for Business */}
          {isBusiness && profile.industry && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="p-1 bg-gray-100 rounded-md">
                <Building2 size={14} className="text-gray-500" />
              </div>
              <span className="truncate">{profile.industry}</span>
            </div>
          )}

          {/* Skills (Professionals only) */}
          {isProfessional && profile.skills && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills
                  .split(',')
                  .slice(0, 3)
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                {profile.skills.split(',').length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                    +{profile.skills.split(',').length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button 
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 ${typeConfig.bgColor} ${typeConfig.textColor} rounded-lg hover:bg-opacity-80 transition-all duration-200 font-medium text-sm group-hover:shadow-md`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <span>View {typeConfig.label}</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
    </div>
  );
}

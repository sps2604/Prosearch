import { Phone, Mail, MapPin, Globe, Linkedin} from "lucide-react";

interface UserProfile {
  name: string;
  profession: string;
  logo_url: string;
  experience: number;
  languages: string;
  skills: string;
  address: string;
  summary: string;
  mobile: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  twitter: string;
  github: string;
  website: string;
  google_my_business: string;
}

interface ProfileCardComponentProps {
  profile: UserProfile;
  compact?: boolean; // ✅ ADDED: For smaller version in ApplyNow
}

export default function ProfileCardComponent({ profile, compact = false }: ProfileCardComponentProps) {
  if (!profile) return null;

  return (
    <div
      className={`w-full ${compact ? 'max-w-sm' : 'max-w-md'} mx-auto rounded-2xl shadow-lg overflow-hidden`}
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Header Section */}
      <div
        className={`relative px-6 ${compact ? 'py-6' : 'py-8'} text-white`}
        style={{
          background:
            "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #1d4ed8 100%)",
        }}
      >
        <div className="flex justify-center mb-4">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Profile"
              className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-full object-cover border-4 shadow-lg`}
              style={{ borderColor: "#ffffff" }}
              crossOrigin="anonymous"
              loading="eager"
            />
          ) : (
            <div
              className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-full flex items-center justify-center border-4 shadow-lg`}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderColor: "#ffffff",
              }}
            >
              <span className={`text-white ${compact ? 'text-lg' : 'text-2xl'} font-bold`}>
                {profile.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>

        <h1 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-center text-white mb-1`}>
          {profile.name}
        </h1>
        <p className="text-center text-blue-100 text-sm">
          {profile.profession}
        </p>
      </div>

      {/* Content Section */}
      <div className={`px-6 ${compact ? 'py-4' : 'py-6'}`} style={{ backgroundColor: "#ffffff" }}>
        {/* Professional Summary */}
        {!compact && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color: "#2563eb" }}>
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
              {profile.summary ||
                `${profile.profession} with ${profile.experience} years of experience. Skilled professional ready to deliver exceptional results.`}
            </p>
          </div>
        )}

        {/* Experience */}
        <div className="mb-4">
          <div className="flex items-center gap-3" style={{ color: "#374151" }}>
            <div className="p-2 rounded-full" style={{ backgroundColor: "#dbeafe" }}>
              <span className="text-xs font-semibold" style={{ color: "#2563eb" }}>
                {profile.experience || 0}Y
              </span>
            </div>
            <span className="text-sm">{profile.experience || 0} years experience</span>
          </div>
        </div>

        {/* Core Skills */}
        {profile.skills && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#1f2937" }}>
              Core Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {profile.skills.split(',').slice(0, compact ? 3 : 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          {profile.mobile && (
            <div className="flex items-center gap-3" style={{ color: "#374151" }}>
              <div className="p-1 rounded-full" style={{ backgroundColor: "#dbeafe" }}>
                <Phone size={12} style={{ color: "#2563eb" }} />
              </div>
              <span className="text-xs">{profile.mobile}</span>
            </div>
          )}

          {profile.email && (
            <div className="flex items-center gap-3" style={{ color: "#374151" }}>
              <div className="p-1 rounded-full" style={{ backgroundColor: "#fee2e2" }}>
                <Mail size={12} style={{ color: "#dc2626" }} />
              </div>
              <span className="text-xs">{profile.email}</span>
            </div>
          )}

          {profile.address && (
            <div className="flex items-center gap-3" style={{ color: "#374151" }}>
              <div className="p-1 rounded-full" style={{ backgroundColor: "#dcfce7" }}>
                <MapPin size={12} style={{ color: "#059669" }} />
              </div>
              <span className="text-xs">{profile.address}</span>
            </div>
          )}
        </div>

        {/* Languages */}
        {profile.languages && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#1f2937" }}>
              Languages
            </h3>
            <p className="text-xs text-gray-600">{profile.languages}</p>
          </div>
        )}

        {/* Social Media & Links */}
        {!compact && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f3f4f6" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#1f2937" }}>
              Social Media & Links
            </h3>
            <div className="flex gap-2">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white p-2 rounded-full transition-colors"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  <Linkedin size={12} />
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white p-2 rounded-full transition-colors"
                  style={{ backgroundColor: "#4b5563" }}
                >
                  <Globe size={12} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

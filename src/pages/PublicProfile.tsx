import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  MessageCircle,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Github,
  Building2
} from "lucide-react";

// ✅ Combined interface for both professional and business profiles
interface ProfileData {
  // Common fields
  name?: string;
  business_name?: string;
  profession?: string;
  industry?: string;
  logo_url: string;
  experience?: number;
  languages?: string;
  skills?: string;
  address?: string;
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
  user_type?: "professional" | "business";
}

export default function PublicProfile() {
  const { name } = useParams<{ name: string }>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!name) {
        setError("Profile name not provided");
        setLoading(false);
        return;
      }

      try {
        const decodedName = decodeURIComponent(name);
        console.log("🔍 Searching for:", decodedName);

        // ✅ First try to find professional profile by name
        const { data: userProfileData, error: userProfileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("name", decodedName);

        console.log("Professional query result:", { data: userProfileData, error: userProfileError });

        if (userProfileData && userProfileData.length > 0 && !userProfileError) {
          console.log("✅ Found professional profile");
          setProfileData({
            ...userProfileData[0],
            user_type: "professional"
          });
          setLoading(false);
          return;
        }

        // ✅ If not found, try to find business profile by business_name
        const { data: businessProfileData, error: businessProfileError } = await supabase
          .from("businesses")
          .select("*")
          .eq("business_name", decodedName);

        console.log("Business query result:", { data: businessProfileData, error: businessProfileError });

        if (businessProfileData && businessProfileData.length > 0 && !businessProfileError) {
          console.log("✅ Found business profile");
          setProfileData({
            ...businessProfileData[0],
            user_type: "business"
          });
          setLoading(false);
          return;
        }

        // ✅ If neither found, show error
        console.log("❌ Profile not found in either table");
        setError(`Profile "${decodedName}" not found`);
        
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [name]);

  const handleWhatsAppClick = () => {
    if (profileData?.whatsapp) {
      window.open(`https://wa.me/${profileData.whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (profileData?.email) {
      window.location.href = `mailto:${profileData.email}`;
    }
  };

  const handlePhoneClick = () => {
    if (profileData?.mobile) {
      window.location.href = `tel:${profileData.mobile}`;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-xl text-red-600 mb-2">Oops!</p>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <p className="text-center text-lg text-gray-600">No profile found</p>
    </div>
  );

  // ✅ Determine display values based on profile type
  const displayName = profileData.user_type === "business" 
    ? profileData.business_name 
    : profileData.name;
  
  const displayTitle = profileData.user_type === "business" 
    ? profileData.industry 
    : profileData.profession;

  const profileTypeLabel = profileData.user_type === "business" 
    ? "Business Profile" 
    : "Professional Profile";

  // ✅ Dynamic gradient based on profile type
  const gradientClass = profileData.user_type === "business"
    ? "bg-gradient-to-r from-orange-500 to-red-600" // Orange for business
    : "bg-gradient-to-r from-blue-500 to-purple-600"; // Blue for professional

  const socialLinks = [
    { key: 'linkedin', url: profileData.linkedin, icon: Linkedin, color: 'text-blue-600', name: 'LinkedIn' },
    { key: 'instagram', url: profileData.instagram, icon: Instagram, color: 'text-pink-600', name: 'Instagram' },
    { key: 'facebook', url: profileData.facebook, icon: Facebook, color: 'text-blue-800', name: 'Facebook' },
    { key: 'youtube', url: profileData.youtube, icon: Youtube, color: 'text-red-600', name: 'YouTube' },
    { key: 'twitter', url: profileData.twitter, icon: Twitter, color: 'text-blue-400', name: 'Twitter' },
    { key: 'github', url: profileData.github, icon: Github, color: 'text-gray-800', name: 'GitHub' },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          {profileData.user_type === "business" ? (
            <Building2 size={24} className="text-orange-600" />
          ) : (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{profileTypeLabel}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Hero Section */}
          <div className={`${gradientClass} px-8 py-12 text-white`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                {profileData.logo_url ? (
                  <img
                    src={profileData.logo_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-4xl font-bold">
                      {displayName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
                <p className="text-xl mb-2 opacity-90">{displayTitle}</p>
                {profileData.user_type === "professional" && profileData.experience && (
                  <div className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-1">
                    <span className="font-medium">
                      {profileData.experience} years experience
                    </span>
                  </div>
                )}
                {profileData.user_type === "business" && (
                  <div className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-1">
                    <span className="font-medium">Business</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {profileData.mobile && (
                <button
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                >
                  <Phone size={18} />
                  Call Now
                </button>
              )}
              
              {profileData.whatsapp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </button>
              )}
              
              {profileData.email && (
                <button
                  onClick={handleEmailClick}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md"
                >
                  <Mail size={18} />
                  Email
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 py-8">
            {/* About Section */}
            {profileData.summary && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {profileData.user_type === "business" ? "About Business" : "About Me"}
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{profileData.summary}</p>
              </div>
            )}

            {/* Skills (Professional only) */}
            {profileData.user_type === "professional" && profileData.skills && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Core Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {profileData.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium shadow-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages (Professional only) */}
            {profileData.user_type === "professional" && profileData.languages && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Languages</h2>
                <p className="text-gray-700 text-lg">{profileData.languages}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.mobile && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-green-500" />
                    <span className="text-gray-700">{profileData.mobile}</span>
                  </div>
                )}
                
                {profileData.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-blue-500" />
                    <span className="text-gray-700">{profileData.email}</span>
                  </div>
                )}
                
                {profileData.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <MapPin size={20} className="text-red-500" />
                    <span className="text-gray-700">{profileData.address}</span>
                  </div>
                )}
                
                {profileData.website && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <Globe size={20} className="text-purple-500" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {profileData.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {profileData.user_type === "business" ? "Connect with Us" : "Connect with Me"}
                </h2>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map(({ key, url, icon: Icon, color, name }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Icon size={20} className={color} />
                      <span className="text-gray-700">{name}</span>
                    </a>
                  ))}
                  
                  {profileData.google_my_business && (
                    <a
                      href={profileData.google_my_business}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MapPin size={20} className="text-green-600" />
                      <span className="text-gray-700">Google My Business</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>This is a {profileData.user_type} profile page</p>
        </div>
      </div>
    </div>
  );
}

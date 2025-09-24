import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
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
  Building2,
  Download,
  Share2,
  ArrowLeft,
  User,
  Star,
  ExternalLink
} from "lucide-react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";

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
  // Additional fields
  created_at?: string;
  services?: string;
  founded_year?: number;
  employee_count?: string;
}

export default function PublicProfile() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

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

  // ✅ NEW: Download functionality
  const handleDownload = async () => {
    if (!headerRef.current || !profileData) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(headerRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: 'white'
      });
      const link = document.createElement('a');
      const fileName = `${(profileData.user_type === 'business' ? (profileData.business_name||'') : (profileData.name||''))}-profile.png`.replace(/\s+/g,'_');
      link.download = fileName || 'profile.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading profile:", error);
    } finally {
      setDownloading(false);
    }
  };

  // ✅ NEW: Share functionality
  const handleShare = async () => {
    setSharing(true);
    try {
      const url = window.location.href;
      const displayName = profileData?.user_type === "business" 
        ? profileData.business_name 
        : profileData?.name;
      
      if (navigator.share) {
        await navigator.share({
          title: `${displayName} - ${profileData?.user_type === "business" ? "Business" : "Professional"} Profile`,
          text: `Check out ${displayName}'s profile`,
          url: url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        alert('Profile link copied to clipboard!');
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setSharing(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {profileData?.user_type === "business" ? (
                <Building2 className="w-12 h-12 text-gray-400" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "Profile not found"}
            </h3>
            <p className="text-gray-600 mb-6">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AfterLoginNavbar />
      
      <div className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                {sharing ? "Sharing..." : "Share"}
              </button>
              
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Content */}
            <div className="lg:col-span-2">
              {/* Header Section for Download */}
              <div className="bg-white shadow-sm mb-6 rounded-xl overflow-hidden" ref={headerRef}>
                <div className="flex items-center gap-3 p-4 bg-gray-50">
                  {profileData.user_type === "business" ? (
                    <Building2 size={24} className="text-orange-600" />
                  ) : (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                  )}
                  <h1 className="text-xl font-bold text-gray-800">{profileTypeLabel}</h1>
                </div>
              </div>

              {/* Main Profile Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    
                    <div className="text-center md:text-left flex-1">
                      <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
                      <p className="text-xl mb-4 opacity-90">{displayTitle}</p>
                      
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {profileData.user_type === "professional" && profileData.experience && (
                          <div className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-2">
                            <span className="font-medium flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              {profileData.experience} years experience
                            </span>
                          </div>
                        )}
                        
                        <div className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-2">
                          <span className="font-medium flex items-center gap-2">
                            {profileData.user_type === "business" ? (
                              <>
                                <Building2 className="w-4 h-4" />
                                Business
                              </>
                            ) : (
                              <>
                                <User className="w-4 h-4" />
                                Professional
                              </>
                            )}
                          </span>
                        </div>
                      </div>
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

                  {/* Services (Business only) */}
                  {profileData.user_type === "business" && profileData.services && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Services</h2>
                      <p className="text-gray-700 leading-relaxed">{profileData.services}</p>
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
                        <button
                          onClick={handlePhoneClick}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <Phone size={20} className="text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{profileData.mobile}</p>
                          </div>
                        </button>
                      )}
                      
                      {profileData.email && (
                        <button
                          onClick={handleEmailClick}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <Mail size={20} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{profileData.email}</p>
                          </div>
                        </button>
                      )}
                      
                      {profileData.address && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                          <MapPin size={20} className="text-red-500" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">{profileData.address}</p>
                          </div>
                        </div>
                      )}
                      
                      {profileData.website && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                          <Globe size={20} className="text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-500">Website</p>
                            <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline font-medium">
                              {profileData.website}
                            </a>
                          </div>
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {socialLinks.map(({ key, url, icon: Icon, color, name }) => (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            <Icon size={20} className={color} />
                            <span className="text-gray-700 font-medium">{name}</span>
                            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                          </a>
                        ))}
                        
                        {profileData.google_my_business && (
                          <a
                            href={profileData.google_my_business}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            <MapPin size={20} className="text-green-600" />
                            <span className="text-gray-700 font-medium">Google My Business</span>
                            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {profileData.user_type === "business" ? (
                      <Building2 className="w-5 h-5 text-gray-500" />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{profileData.user_type}</p>
                    </div>
                  </div>

                  {profileData.user_type === "professional" && profileData.experience && (
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{profileData.experience} years</p>
                      </div>
                    </div>
                  )}

                  {profileData.user_type === "business" && profileData.founded_year && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Founded</p>
                        <p className="font-medium">{profileData.founded_year}</p>
                      </div>
                    </div>
                  )}

                  {profileData.user_type === "business" && profileData.employee_count && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Team Size</p>
                        <p className="font-medium">{profileData.employee_count}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? "Downloading..." : "Download Profile"}
                  </button>

                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <Share2 className="w-4 h-4" />
                    {sharing ? "Sharing..." : "Share Profile"}
                  </button>

                  {profileData.email && (
                    <button
                      onClick={handleEmailClick}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { 
  Eye, 
  Download, 
  Share2, 
  Copy, 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  X,
  MoreVertical
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

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

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // ✅ ADD: Mobile dropdown state
  const [showMobileActions, setShowMobileActions] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          setError("Failed to get user");
          return;
        }

        if (!user) {
          navigate("/login");
          return;
        }

        const { data: userProfileData, error: userProfileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userProfileError) {
          if (userProfileError.code === 'PGRST116') {
            setError("Profile not found. Please create your profile first.");
            setTimeout(() => navigate("/create-profile"), 2000);
          } else {
            setError("Error fetching profile: " + userProfileError.message);
          }
        } else {
          setUserProfile(userProfileData as UserProfile);
        }
      } catch (err) {
        setError("Unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleViewCard = () => {
    navigate("/profile-card");
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current || !userProfile) return;
    setDownloading(true);
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = pageWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      const x = 10;
      const y = imgHeight > pageHeight - 20 ? 10 : (pageHeight - imgHeight) / 2;
      
      pdf.addImage(dataUrl, "PNG", x, y, imgWidth, Math.min(imgHeight, pageHeight - 20));
      pdf.save(`${userProfile.name.replace(/\s+/g, '_')}-profile.pdf`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const profileUrl = `${window.location.origin}/public-profile/${user?.id}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
      setShowShareModal(false);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleWhatsAppShare = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const profileUrl = `${window.location.origin}/public-profile/${user?.id}`;
    const message = `Check out my professional profile: ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    setShowShareModal(false);
  };

  const handleSocialShare = async (platform: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const profileUrl = `${window.location.origin}/public-profile/${user?.id}`;
    const text = `Check out my professional profile`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(profileUrl)}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
    setShowShareModal(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-lg">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-red-500 text-lg">{error}</p>
    </div>
  );

  if (!userProfile) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-lg">No profile found</p>
    </div>
  );

  return (
    <>
      <AfterLoginNavbar />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" ref={cardRef}>
        {/* ✅ RESPONSIVE Header with Action Buttons */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 md:gap-6">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xl md:text-2xl">
                    {userProfile.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{userProfile.name}</h1>
                <p className="text-gray-600 text-sm md:text-base">{userProfile.profession}</p>
                <p className="text-xs md:text-sm text-gray-500">{userProfile.experience} years experience</p>
              </div>
            </div>
            
            {/* ✅ DESKTOP: Original Large Buttons (hidden on mobile) */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={handleViewCard}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Eye size={16} />
                View Card
              </button>
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
              >
                <Download size={16} />
                {downloading ? "Downloading..." : "Download Card"}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
              >
                <Share2 size={16} />
                Share Card
              </button>
            </div>

            {/* ✅ MOBILE: Dropdown Menu (only visible on mobile) */}
            <div className="sm:hidden relative ml-auto">
              <button
                onClick={() => setShowMobileActions(!showMobileActions)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {/* Mobile Actions Dropdown */}
              {showMobileActions && (
                <div 
                  className="absolute right-0 top-12 w-48 rounded-lg shadow-lg border overflow-hidden z-10"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <button
                    onClick={() => {
                      handleViewCard();
                      setShowMobileActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={16} />
                    <span>View Card</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadCard();
                      setShowMobileActions(false);
                    }}
                    disabled={downloading}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Download size={16} />
                    <span>{downloading ? "Downloading..." : "Download Card"}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleShare();
                      setShowMobileActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={16} />
                    <span>Share Card</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ RESPONSIVE Contact Info */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm md:text-base">
            {userProfile.mobile && <p>📞 {userProfile.mobile}</p>}
            {userProfile.whatsapp && <p>💬 {userProfile.whatsapp}</p>}
            {userProfile.email && <p>📧 {userProfile.email}</p>}
            {userProfile.address && <p>📍 {userProfile.address}</p>}
            {userProfile.website && <p>🌐 {userProfile.website}</p>}
          </div>
        </div>

        {/* About Me */}
        {userProfile.summary && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">About Me</h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">{userProfile.summary}</p>
          </div>
        )}

        {/* ✅ RESPONSIVE Skills */}
        {userProfile.skills && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Core Skills</h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {userProfile.languages && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Languages</h2>
            <p className="text-gray-700 text-sm md:text-base">{userProfile.languages}</p>
          </div>
        )}

        {/* ✅ RESPONSIVE Social Links */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Social Media & Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userProfile.linkedin && (
              <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline text-sm md:text-base">
                🔗 LinkedIn
              </a>
            )}
            {userProfile.instagram && (
              <a href={userProfile.instagram} target="_blank" rel="noopener noreferrer"
                 className="text-pink-600 hover:underline text-sm md:text-base">
                📸 Instagram
              </a>
            )}
            {userProfile.facebook && (
              <a href={userProfile.facebook} target="_blank" rel="noopener noreferrer"
                 className="text-blue-800 hover:underline text-sm md:text-base">
                📘 Facebook
              </a>
            )}
            {userProfile.youtube && (
              <a href={userProfile.youtube} target="_blank" rel="noopener noreferrer"
                 className="text-red-600 hover:underline text-sm md:text-base">
                ▶️ YouTube
              </a>
            )}
            {userProfile.twitter && (
              <a href={userProfile.twitter} target="_blank" rel="noopener noreferrer"
                 className="text-blue-400 hover:underline text-sm md:text-base">
                🐦 Twitter
              </a>
            )}
            {userProfile.github && (
              <a href={userProfile.github} target="_blank" rel="noopener noreferrer"
                 className="text-gray-800 hover:underline text-sm md:text-base">
                💻 GitHub
              </a>
            )}
            {userProfile.google_my_business && (
              <a href={userProfile.google_my_business} target="_blank" rel="noopener noreferrer"
                 className="text-green-600 hover:underline text-sm md:text-base">
                📍 Google My Business
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ✅ RESPONSIVE Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Profile</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <Copy size={20} className="text-gray-600" />
                <span>Copy Link</span>
              </button>
              
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <MessageCircle size={20} className="text-green-600" />
                <span>WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('facebook')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <Facebook size={20} className="text-blue-600" />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <Twitter size={20} className="text-blue-400" />
                <span>Twitter</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <Linkedin size={20} className="text-blue-700" />
                <span>LinkedIn</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('email')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <Mail size={20} className="text-gray-600" />
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Mobile: Close dropdown when clicking outside */}
      {showMobileActions && (
        <div 
          className="fixed inset-0 z-0 sm:hidden" 
          onClick={() => setShowMobileActions(false)}
        />
      )}
    </>
  );
}

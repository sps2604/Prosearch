import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { Eye, Download, Edit } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useUser } from "../context/UserContext";

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
  const { profile } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      if (profile.user_type === "professional") {
        const fetchProfessionalProfile = async () => {
          try {
            const { data: userProfileData, error: userProfileError } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", profile.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (userProfileError) {
              setError("Error fetching professional profile: " + userProfileError.message);
            } else {
              setUserProfile(userProfileData?.[0] as UserProfile || null);
            }
          } catch (err) {
            setError("Unexpected error occurred while fetching professional profile");
          } finally {
            setLoading(false);
          }
        };
        fetchProfessionalProfile();
      } else if (profile.user_type === "business") {
        navigate("/business-profile");
      } else {
        setError("Invalid or missing user type.");
        setLoading(false);
      }
    } else {
      setLoading(false);
      navigate("/login");
    }
  }, [profile, navigate]);

  const handleViewCard = () => navigate("/profile-card");

  const handleDownloadPdf = async () => {
    if (!cardRef.current || !userProfile) return;

    setDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        filter: (node) => !(node.tagName === "IMG"),
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);

      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${userProfile.name}-profile.pdf`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg">Loading profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => navigate("/home2")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-900 text-lg mb-4">No profile found</p>
          <button
            onClick={() => navigate("/create-profile")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <AfterLoginNavbar />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 bg-gray-50" ref={cardRef}>
        {/* Header with Action Buttons */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 md:gap-6">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center border-2 border-gray-200">
                  <span className="text-gray-600 text-2xl font-semibold">
                    {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {userProfile.name}
                </h1>
                <p className="text-gray-600">{userProfile.profession}</p>
                <p className="text-sm text-gray-500">
                  {userProfile.experience} years experience
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/edit-profile")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleViewCard}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Eye size={16} />
                View
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
              >
                <Download size={16} />
                {downloading ? "Downloading..." : "PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userProfile.mobile && (
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-blue-600">📞</span>
                {userProfile.mobile}
              </p>
            )}
            {userProfile.whatsapp && (
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-green-600">💬</span>
                {userProfile.whatsapp}
              </p>
            )}
            {userProfile.email && (
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-red-600">📧</span>
                {userProfile.email}
              </p>
            )}
            {userProfile.address && (
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-orange-600">📍</span>
                {userProfile.address}
              </p>
            )}
            {userProfile.website && (
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-blue-600">🌐</span>
                <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {userProfile.website}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* About Me */}
        {userProfile.summary && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">About Me</h2>
            <p className="text-gray-700 leading-relaxed">
              {userProfile.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {userProfile.skills && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
              Core Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.split(",").map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm border border-blue-200"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {userProfile.languages && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
              Languages
            </h2>
            <p className="text-gray-700">{userProfile.languages}</p>
          </div>
        )}

        {/* Social Links */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
            Social Media & Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userProfile.linkedin && (
              <a
                href={userProfile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
              >
                <span>🔗</span> LinkedIn
              </a>
            )}
            {userProfile.instagram && (
              <a
                href={userProfile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-800 hover:underline transition-colors flex items-center gap-2"
              >
                <span>📸</span> Instagram
              </a>
            )}
            {userProfile.facebook && (
              <a
                href={userProfile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:text-blue-900 hover:underline transition-colors flex items-center gap-2"
              >
                <span>📘</span> Facebook
              </a>
            )}
            {userProfile.youtube && (
              <a
                href={userProfile.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-800 hover:underline transition-colors flex items-center gap-2"
              >
                <span>▶️</span> YouTube
              </a>
            )}
            {userProfile.twitter && (
              <a
                href={userProfile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 hover:underline transition-colors flex items-center gap-2"
              >
                <span>🐦</span> Twitter
              </a>
            )}
            {userProfile.github && (
              <a
                href={userProfile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900 hover:underline transition-colors flex items-center gap-2"
              >
                <span>💻</span> GitHub
              </a>
            )}
            {userProfile.google_my_business && (
              <a
                href={userProfile.google_my_business}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 hover:underline transition-colors flex items-center gap-2"
              >
                <span>📍</span> Google My Business
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

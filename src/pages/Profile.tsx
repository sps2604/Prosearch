import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { Eye, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useUser } from "../context/UserContext"; // Import useUser

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
  // Consume profile from global UserContext
  const { profile } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Set loading initially based on whether profile is already in context
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If profile is already in context, set loading to false and populate userProfile
    if (profile) {
      if (profile.user_type === "professional") {
        // Fetch detailed professional profile from 'user_profiles' table
        const fetchProfessionalProfile = async () => {
          try {
            // ✅ FIXED: Removed .single() and added .limit(1)
            const { data: userProfileData, error: userProfileError } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", profile.id) // Use profile.id from context
              .order('created_at', { ascending: false })
              .limit(1); // ✅ Changed from .single()

            if (userProfileError) {
              setError("Error fetching professional profile: " + userProfileError.message);
            } else {
              // ✅ FIXED: Access data as array
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
        // Redirect businessmen to their specific profile page
        navigate("/business-profile");
      } else {
        // Fallback for unexpected user types or if user_type is missing
        setError("Invalid or missing user type.");
        setLoading(false);
      }
    } else {
      // If profile is not in context, it means user is not logged in or context is not yet loaded
      // Redirect to login or keep loading if Auth state is still resolving.
      // A more robust solution might involve a `ProtectedRoute` or checking `supabase.auth.getSession()` here too.
      setLoading(false); // If profile is null, assume not authenticated for this page's purpose
      navigate("/login");
    }
  }, [profile, navigate]); // Rerun when profile in context changes or navigate function changes

  const handleViewCard = () => navigate("/profile-card");

  const handleDownloadPdf = async () => {
    if (!cardRef.current || !userProfile) return;

    setDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        filter: (node) => !(node.tagName === "IMG"), // skip <img> tags
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">No profile found</p>
      </div>
    );

  return (
    <>
      <AfterLoginNavbar />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" ref={cardRef}>
        {/* Header with Action Buttons */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 md:gap-6">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">
                    {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
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
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <p className="text-gray-700 leading-relaxed">
              {userProfile.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {userProfile.skills && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Core Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.split(",").map((skill, index) => (
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
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Languages
            </h2>
            <p className="text-gray-700">{userProfile.languages}</p>
          </div>
        )}

        {/* Social Links */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Social Media & Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userProfile.linkedin && (
              <a
                href={userProfile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                🔗 LinkedIn
              </a>
            )}
            {userProfile.instagram && (
              <a
                href={userProfile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                📸 Instagram
              </a>
            )}
            {userProfile.facebook && (
              <a
                href={userProfile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:underline"
              >
                📘 Facebook
              </a>
            )}
            {userProfile.youtube && (
              <a
                href={userProfile.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                ▶️ YouTube
              </a>
            )}
            {userProfile.twitter && (
              <a
                href={userProfile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                🐦 Twitter
              </a>
            )}
            {userProfile.github && (
              <a
                href={userProfile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:underline"
              >
                💻 GitHub
              </a>
            )}
            {userProfile.google_my_business && (
              <a
                href={userProfile.google_my_business}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                📍 Google My Business
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

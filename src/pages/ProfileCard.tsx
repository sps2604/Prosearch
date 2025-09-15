import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { Download, ArrowLeft, Share2, Phone, Mail, MapPin, Globe, Linkedin, Edit } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

export default function ProfileCard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
          setError("Error fetching profile: " + userProfileError.message);
        } else {
          setUserProfile(userProfileData as UserProfile);
        }
      } catch {
        setError("Unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleDownload = async (format: "pdf" | "png") => {
    if (!cardRef.current || !userProfile) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        height: cardRef.current.scrollHeight,
        width: cardRef.current.scrollWidth,
      });

      if (format === "png") {
        const link = document.createElement("a");
        link.download = `${userProfile.name}-profile-card.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${userProfile.name}-profile-card.pdf`);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/public-profile/${userProfile?.name}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userProfile?.name}'s Profile`,
          text: `Check out ${userProfile?.name}'s professional profile`,
          url: profileUrl,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert("Profile link copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">Loading profile card...</p>
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

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header with actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={() => handleDownload("png")}
              disabled={downloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? "Downloading..." : "PNG"}
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? "Downloading..." : "PDF"}
            </button>
          </div>
        </div>

        {/* Modern Business Card Profile */}
        <div
          ref={cardRef}
          className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 px-6 py-8 text-white">
            {/* Edit and Logout buttons (top right) */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors">
                <Edit size={16} className="text-white" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 text-sm transition-colors">
                Logout
              </button>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-center text-white mb-1">
              {userProfile.name}
            </h1>
          </div>

          {/* White Content Section */}
          <div className="px-6 py-6 bg-white">
            {/* Professional Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-blue-600 mb-3">Professional Summary</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {userProfile.summary || `${userProfile.profession} with ${userProfile.experience} years of experience. Skilled professional ready to deliver exceptional results.`}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              {userProfile.mobile && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm">{userProfile.mobile}</span>
                </div>
              )}

              {userProfile.whatsapp && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Phone size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm">{userProfile.whatsapp}</span>
                </div>
              )}

              {userProfile.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Mail size={16} className="text-red-600" />
                  </div>
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              )}

              {userProfile.address && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-green-100 p-2 rounded-full">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm">{userProfile.address}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800">Social Media</h3>
                <h3 className="text-sm font-semibold text-gray-800">Share This Profile</h3>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                {/* Social Media Icons */}
                <div className="flex gap-2">
                  {userProfile.linkedin && (
                    <a
                      href={userProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {userProfile.website && (
                    <a
                      href={userProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <Globe size={16} />
                    </a>
                  )}
                </div>

                {/* Share Icons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                  <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
                    <Phone size={16} />
                  </button>
                  <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Linkedin size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">Powered by Softcadd</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

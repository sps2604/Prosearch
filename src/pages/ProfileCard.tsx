import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import {
  Download,
  ArrowLeft,
  Share2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  MoreVertical,
} from "lucide-react";
import { toPng } from "html-to-image";
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
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showActions, setShowActions] = useState(false);
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

        // ✅ FIXED: Removed .single() and added .limit(1)
        const { data: userProfileData, error: userProfileError } =
          await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(1); // ✅ Changed from .single()

        if (userProfileError) {
          setError("Error fetching profile: " + userProfileError.message);
        } else {
          // ✅ FIXED: Access data as array
          setUserProfile(userProfileData?.[0] as UserProfile || null);
        }
      } catch {
        setError("Unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ✅ Fixed download function
  const handleDownload = async (format: "pdf" | "png") => {
    if (!cardRef.current || !userProfile) return;

    if (format === "png") {
      setDownloadingPng(true);
    } else {
      setDownloadingPdf(true);
    }

    try {
      const element = cardRef.current;
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        width: element.clientWidth,
        height: element.clientHeight,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          background: '#ffffff',
          margin: '0',
        }
      });

      if (format === "png") {
        const link = document.createElement("a");
        link.download = `${userProfile.name.replace(/\s+/g, "_")}-profile-card.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(dataUrl);
        // Keep margins to avoid clipping
        const margin = 10;
        let imgWidth = pageWidth - margin * 2;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (imgHeight > pageHeight) {
          imgHeight = pageHeight - margin * 2;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
        pdf.save(`${userProfile.name.replace(/\s+/g, "_")}-profile-card.pdf`);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      if (format === "png") {
        setDownloadingPng(false);
      } else {
        setDownloadingPdf(false);
      }
    }
  };

  // ✅ Fixed share function
  const handleShare = async () => {
    const safeName = encodeURIComponent(userProfile?.name ?? "");
    const profileUrl = `${window.location.origin}/public-profile/${safeName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userProfile?.name}'s Profile`,
          text: `Check out ${userProfile?.name}'s professional profile`,
          url: profileUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-lg">Loading profile card...</p>
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

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Desktop View */}
        <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: "#9333ea" }}
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={() => handleDownload("png")}
              disabled={downloadingPng}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#2563eb" }}
            >
              <Download size={16} />
              {downloadingPng ? "Downloading..." : "PNG"}
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloadingPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#059669" }}
            >
              <Download size={16} />
              {downloadingPdf ? "Downloading..." : "PDF"}
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex sm:hidden items-center justify-between mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {showActions && (
              <div
                className="absolute right-0 top-12 w-48 rounded-lg shadow-lg border overflow-hidden z-10"
                style={{ backgroundColor: "#ffffff" }}
              >
                <button
                  onClick={() => {
                    handleShare();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share Profile</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload("png");
                    setShowActions(false);
                  }}
                  disabled={downloadingPng}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>
                    {downloadingPng ? "Downloading PNG..." : "Download PNG"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    handleDownload("pdf");
                    setShowActions(false);
                  }}
                  disabled={downloadingPdf}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>
                    {downloadingPdf ? "Downloading PDF..." : "Download PDF"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div
          ref={cardRef}
          className="w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div
            className="relative px-6 py-8 text-white"
            style={{
              background:
                "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #1d4ed8 100%)",
            }}
          >
            <div className="flex justify-center mb-4">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: "#ffffff" }}
                  crossOrigin="anonymous"
                  loading="eager"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "#ffffff",
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-center text-white mb-1">
              {userProfile.name}
            </h1>
          </div>

          <div className="px-6 py-6" style={{ backgroundColor: "#ffffff" }}>
            <div className="mb-6">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "#2563eb" }}
              >
                Professional Summary
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#374151" }}
              >
                {userProfile.summary ||
                  `${userProfile.profession} with ${userProfile.experience} years of experience. Skilled professional ready to deliver exceptional results.`}
              </p>
            </div>

            <div className="space-y-3">
              {userProfile.mobile && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: "#374151" }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: "#dbeafe" }}
                  >
                    <Phone size={16} style={{ color: "#2563eb" }} />
                  </div>
                  <span className="text-sm">{userProfile.mobile}</span>
                </div>
              )}

              {userProfile.whatsapp && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: "#374151" }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: "#dcfce7" }}
                  >
                    <Phone size={16} style={{ color: "#059669" }} />
                  </div>
                  <span className="text-sm">{userProfile.whatsapp}</span>
                </div>
              )}

              {userProfile.email && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: "#374151" }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: "#fee2e2" }}
                  >
                    <Mail size={16} style={{ color: "#dc2626" }} />
                  </div>
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              )}

              {userProfile.address && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: "#374151" }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: "#dcfce7" }}
                  >
                    <MapPin size={16} style={{ color: "#059669" }} />
                  </div>
                  <span className="text-sm">{userProfile.address}</span>
                </div>
              )}
            </div>

            <div
              className="mt-6 pt-4"
              style={{ borderTop: "1px solid #f3f4f6" }}
            >
              <div className="flex justify-between items-center">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "#1f2937" }}
                >
                  Social Media
                </h3>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "#1f2937" }}
                >
                  Share This Profile
                </h3>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  {userProfile.linkedin && (
                    <a
                      href={userProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white p-2 rounded-full transition-colors"
                      style={{ backgroundColor: "#2563eb" }}
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {userProfile.website && (
                    <a
                      href={userProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white p-2 rounded-full transition-colors"
                      style={{ backgroundColor: "#4b5563" }}
                    >
                      <Globe size={16} />
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="text-white p-2 rounded-full transition-colors"
                    style={{ backgroundColor: "#3b82f6" }}
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    className="text-white p-2 rounded-full transition-colors"
                    style={{ backgroundColor: "#059669" }}
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    className="text-white p-2 rounded-full transition-colors"
                    style={{ backgroundColor: "#2563eb" }}
                  >
                    <Linkedin size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div
              className="mt-4 pt-4 text-center"
              style={{ borderTop: "1px solid #f3f4f6" }}
            >
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Powered by Softcadd
              </p>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div
          className="fixed inset-0 z-0 sm:hidden"
          onClick={() => setShowActions(false)}
        />
      )}
    </>
  );
}

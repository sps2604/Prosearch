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
  Globe,
  Linkedin,
  MoreVertical,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

interface BusinessProfileData {
  id: string;
  business_name: string;
  industry: string;
  logo_url: string;
  website: string;
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
  google_my_business: string;
  user_id: string;
  user_type: string;
  created_at: string;
}

export default function BusinessProfileCard() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
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

        const { data: businessProfileData, error: businessProfileError } =
          await supabase
            .from("businesses")
            .select("*")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (businessProfileError) {
          setError("Error fetching profile: " + businessProfileError.message);
        } else {
          setBusinessProfile(businessProfileData?.[0] as BusinessProfileData || null);
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
    if (!cardRef.current || !businessProfile) return;

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
        link.download = `${businessProfile.business_name.replace(/\s+/g, "_")}-profile-card.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(dataUrl);
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
        pdf.save(`${businessProfile.business_name.replace(/\s+/g, "_")}-profile-card.pdf`);
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

  const handleShare = async () => {
    const safeName = encodeURIComponent(businessProfile?.business_name ?? "");
    const profileUrl = `${window.location.origin}/public-business-profile/${safeName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${businessProfile?.business_name}'s Profile`,
          text: `Check out ${businessProfile?.business_name}'s business profile`,
          url: profileUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-900 text-lg">Loading business card...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => navigate("/business-profile")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );

  if (!businessProfile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-gray-900 text-lg mb-4">No business profile found</p>
        <button
          onClick={() => navigate("/create-business-profile")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Business Profile
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AfterLoginNavbar />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50">
        {/* Desktop View */}
        <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            onClick={() => navigate("/business-profile")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors bg-white border border-gray-200"
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
            onClick={() => navigate("/business-profile")}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors bg-white border border-gray-200"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors bg-white border border-gray-200"
            >
              <MoreVertical size={20} />
            </button>

            {showActions && (
              <div className="absolute right-0 top-12 w-48 rounded-lg shadow-lg border overflow-hidden z-10 bg-white border-gray-200">
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
          className="w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white border border-gray-200"
        >
          <div
            className="relative px-6 py-8 text-white"
            style={{
              background:
                "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
            }}
          >
            <div className="flex justify-center mb-4">
              {businessProfile.logo_url ? (
                <img
                  src={businessProfile.logo_url}
                  alt="Business Logo"
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
                    {businessProfile.business_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-center text-white mb-1">
              {businessProfile.business_name}
            </h1>
            <p className="text-center text-white/90 text-sm">
              {businessProfile.industry}
            </p>
          </div>

          <div className="px-6 py-6 bg-white">
            <div className="mb-6">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "#2563eb" }}
              >
                Business Summary
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#374151" }}
              >
                {businessProfile.summary ||
                  `Specializing in ${businessProfile.industry || "various services"}, ${businessProfile.business_name} is committed to delivering excellence.`}
              </p>
            </div>

            <div className="space-y-3">
              {businessProfile.mobile && (
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
                  <span className="text-sm">{businessProfile.mobile}</span>
                </div>
              )}

              {businessProfile.whatsapp && (
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
                  <span className="text-sm">{businessProfile.whatsapp}</span>
                </div>
              )}

              {businessProfile.email && (
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
                  <span className="text-sm">{businessProfile.email}</span>
                </div>
              )}

              {businessProfile.website && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: "#374151" }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: "#dcfce7" }}
                  >
                    <Globe size={16} style={{ color: "#059669" }} />
                  </div>
                  <span className="text-sm">{businessProfile.website}</span>
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
                  {businessProfile.linkedin && (
                    <a
                      href={businessProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white p-2 rounded-full transition-colors"
                      style={{ backgroundColor: "#2563eb" }}
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {businessProfile.website && (
                    <a
                      href={businessProfile.website}
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
    </div>
  );
}

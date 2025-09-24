import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { Eye, Download, Edit, Building, Globe, Phone, Mail } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useUser } from "../context/UserContext";

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
  created_at: string;
  user_id: string;
  user_type: string;
}

export default function BusinessProfilePage() {
  const { profile, setProfile } = useUser();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("BusinessProfilePage: useEffect triggered.");
    console.log("BusinessProfilePage: Profile from context:", profile);

    if (profile) {
      if (profile.user_type === "business") {
        console.log("BusinessProfilePage: User is business type. Fetching detailed profile...");
        const fetchBusinessProfileData = async () => {
          try {
            console.log("BusinessProfilePage: Fetching business profile for ID:", profile.id);
            const { data: businessProfileData, error: businessProfileError } = await supabase
              .from("businesses")
              .select("*")
              .eq("user_id", profile.id)
              .order('created_at', { ascending: false })
              .limit(1);

            console.log("BusinessProfilePage: Supabase response:", { data: businessProfileData, error: businessProfileError });

            if (businessProfileError) {
              setError("Error fetching business profile: " + businessProfileError.message);
              console.error("BusinessProfilePage: Error fetching business profile:", businessProfileError);
            } else {
              setBusinessProfile(businessProfileData?.[0] as BusinessProfileData || null);
              console.log("BusinessProfilePage: Business profile data set successfully.");
            }
          } catch (err) {
            setError("Unexpected error occurred while fetching business profile");
            console.error("BusinessProfilePage: Unexpected error during fetch:", err);
          } finally {
            setLoading(false);
            console.log("BusinessProfilePage: Loading set to false in finally block.");
          }
        };
        fetchBusinessProfileData();
      } else if (profile.user_type === "professional") {
        console.log("BusinessProfilePage: User is professional type. Redirecting to /profile.");
        navigate("/profile");
      } else {
        console.warn("BusinessProfilePage: Invalid or missing user type in profile.", profile.user_type);
        setError("Invalid or missing user type.");
        setLoading(false);
      }
    } else {
      console.warn("BusinessProfilePage: Profile not found in context. Redirecting to /login.");
      setLoading(false);
      navigate("/login");
    }
  }, [profile, navigate, setProfile]);

  const handleViewCard = () => navigate("/business-profile-card");

  const handleDownloadPdf = async () => {
    if (!cardRef.current || !businessProfile) return;

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
      pdf.save(`${businessProfile.business_name}-profile.pdf`);
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
          <p className="text-gray-900 text-lg">Loading business profile...</p>
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

  if (!businessProfile)
    return (
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

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 bg-gray-50" ref={cardRef}>
        {/* Header with Action Buttons */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Business Profile Info */}
            <div className="flex items-center gap-4 md:gap-6">
              {businessProfile.logo_url ? (
                <img
                  src={businessProfile.logo_url}
                  alt="Business Logo"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center border-2 border-gray-200">
                  <span className="text-gray-600 text-2xl font-semibold">
                    {businessProfile.business_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {businessProfile.business_name}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Building size={16} />
                  {businessProfile.industry}
                </p>
                {businessProfile.website && (
                  <p className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                    <a href={businessProfile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <Globe size={14} />
                      {businessProfile.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/edit-business-profile")}
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
                View Card
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {businessProfile.mobile && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="text-gray-900 font-medium">{businessProfile.mobile}</p>
                </div>
              </div>
            )}
            {businessProfile.whatsapp && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={18} className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="text-gray-900 font-medium">{businessProfile.whatsapp}</p>
                </div>
              </div>
            )}
            {businessProfile.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={18} className="text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{businessProfile.email}</p>
                </div>
              </div>
            )}
            {businessProfile.website && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a href={businessProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    {businessProfile.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About Business */}
        {businessProfile.summary && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">About Business</h2>
            <p className="text-gray-700 leading-relaxed">
              {businessProfile.summary}
            </p>
          </div>
        )}

        {/* Social Links */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
            Social Media & Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessProfile.linkedin && (
              <a
                href={businessProfile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                <span>🔗</span> LinkedIn
              </a>
            )}
            {businessProfile.instagram && (
              <a
                href={businessProfile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-800 hover:underline transition-colors"
              >
                <span>📸</span> Instagram
              </a>
            )}
            {businessProfile.facebook && (
              <a
                href={businessProfile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-800 hover:text-blue-900 hover:underline transition-colors"
              >
                <span>📘</span> Facebook
              </a>
            )}
            {businessProfile.youtube && (
              <a
                href={businessProfile.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:underline transition-colors"
              >
                <span>▶️</span> YouTube
              </a>
            )}
            {businessProfile.twitter && (
              <a
                href={businessProfile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-600 hover:underline transition-colors"
              >
                <span>🐦</span> Twitter
              </a>
            )}
            {businessProfile.github && (
              <a
                href={businessProfile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-800 hover:text-gray-900 hover:underline transition-colors"
              >
                <span>💻</span> GitHub
              </a>
            )}
            {businessProfile.google_my_business && (
              <a
                href={businessProfile.google_my_business}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-800 hover:underline transition-colors"
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

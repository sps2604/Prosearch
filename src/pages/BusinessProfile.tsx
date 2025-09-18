import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { Eye, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useUser } from "../context/UserContext"; // Import useUser

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
}

export default function BusinessProfilePage() {
  // Consume profile from global UserContext
  const { profile, setProfile } = useUser(); // ✅ Add setProfile
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  // Set loading initially based on whether profile is already in context
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // ✅ REPLACE your useEffect with this robust version:
  useEffect(() => {
    console.log("🔍 BusinessProfile Debug:");
    console.log("Current profile from context:", profile);
    console.log("User type:", profile?.user_type);

    const loadBusinessProfile = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("No authenticated user:", userError);
          navigate("/login");
          return;
        }

        // ✅ PRIORITY 1: Check if profile context has business type
        if (profile?.user_type === "business") {
          console.log("✅ User is business type from context, fetching profile data...");
          
          // Fetch business profile data
          const { data: businessData, error: businessError } = await supabase
            .from("businesses")
            .select("*")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (businessError) {
            console.error("Error fetching business data:", businessError);
            setError("Error loading business profile");
          } else if (businessData?.[0]) {
            setBusinessProfile(businessData[0]);
            console.log("✅ Business profile loaded successfully");
          } else {
            console.log("❌ No business profile found, redirecting to create");
            navigate("/create-business-profile");
          }
        }
        // ✅ PRIORITY 2: Check if profile context says professional
        else if (profile?.user_type === "professional") {
          console.log("❌ User is professional type, redirecting to professional profile");
          navigate("/profile");
          return;
        }
        // ✅ PRIORITY 3: Profile context is empty/undefined - check database
        else {
          console.log("⚠️ No user type in context, checking database...");
          
          // First check if business profile exists
          const { data: businessData, error: businessError } = await supabase
            .from("businesses")
            .select("*")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (businessData?.[0]) {
            console.log("✅ Found business profile in database, updating context");
            
            // Update context with business profile
            setProfile({
              id: user.id,
              business_name: businessData[0].business_name,
              email: user.email,
              user_type: "business",
            });
            
            setBusinessProfile(businessData[0]);
          } else {
            // Check if user has professional profile
            const { data: professionalData } = await supabase
              .from("user_profiles")
              .select("user_type")
              .eq("user_id", user.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (professionalData?.[0]?.user_type === "professional") {
              console.log("❌ User is professional, redirecting");
              navigate("/profile");
            } else {
              console.log("❌ No profile found, redirecting to create business profile");
              navigate("/create-business-profile");
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Unexpected error loading profile");
      } finally {
        setLoading(false);
      }
    };

    loadBusinessProfile();
  }, [profile, navigate, setProfile]); // ✅ Add setProfile to dependencies

  const handleViewCard = () => navigate("/business-profile-card");

  const handleDownloadPdf = async () => {
    if (!cardRef.current || !businessProfile) return;

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">Loading business profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!businessProfile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">No business profile found</p>
      </div>
    );

  return (
    <>
      <AfterLoginNavbar />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" ref={cardRef}>
        {/* Header with Action Buttons */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Business Profile Info */}
            <div className="flex items-center gap-4 md:gap-6">
              {businessProfile.logo_url ? (
                <img
                  src={businessProfile.logo_url}
                  alt="Business Logo"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">
                    {businessProfile.business_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  {businessProfile.business_name}
                </h1>
                <p className="text-gray-600">{businessProfile.industry}</p>
                {businessProfile.website && (
                  <p className="text-sm text-blue-500 hover:underline">
                    <a href={businessProfile.website} target="_blank" rel="noopener noreferrer">
                      {businessProfile.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
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
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessProfile.mobile && <p>📞 {businessProfile.mobile}</p>}
            {businessProfile.whatsapp && <p>💬 {businessProfile.whatsapp}</p>}
            {businessProfile.email && <p>📧 {businessProfile.email}</p>}
            {businessProfile.website && <p>🌐 <a href={businessProfile.website} target="_blank" rel="noopener noreferrer">{businessProfile.website}</a></p>}
          </div>
        </div>

        {/* About Business */}
        {businessProfile.summary && (
          <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">About Business</h2>
            <p className="text-gray-700 leading-relaxed">
              {businessProfile.summary}
            </p>
          </div>
        )}

        {/* Social Links */}
        <div className="bg-white shadow-md rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Social Media & Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessProfile.linkedin && (
              <a
                href={businessProfile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                🔗 LinkedIn
              </a>
            )}
            {businessProfile.instagram && (
              <a
                href={businessProfile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                📸 Instagram
              </a>
            )}
            {businessProfile.facebook && (
              <a
                href={businessProfile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:underline"
              >
                📘 Facebook
              </a>
            )}
            {businessProfile.youtube && (
              <a
                href={businessProfile.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                ▶️ YouTube
              </a>
            )}
            {businessProfile.twitter && (
              <a
                href={businessProfile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                🐦 Twitter
              </a>
            )}
            {businessProfile.github && (
              <a
                href={businessProfile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:underline"
              >
                💻 GitHub
              </a>
            )}
            {businessProfile.google_my_business && (
              <a
                href={businessProfile.google_my_business}
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

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toPng } from "html-to-image";
import { 
  Download, 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  ArrowLeft,
  Share2,
  MapPin,
  Calendar,
  Users
} from "lucide-react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";

interface BusinessRow {
  id: string;
  business_name: string;
  industry?: string;
  logo_url?: string;
  website?: string;
  summary?: string;
  mobile?: string;
  email?: string;
  address?: string;
  founded_year?: number;
  employee_count?: string;
  services?: string;
  created_at?: string;
}

export default function PublicBusinessCard() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      if (!name) {
        setError("Business name missing");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("business_name", decodeURIComponent(name))
          .maybeSingle();
        if (error) throw error;
        setBusiness(data ?? null);
        if (!data) setError("Business not found");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch business");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [name]);

  const downloadPng = async () => {
    if (!cardRef.current || !business) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: 'white'
      });
      const link = document.createElement("a");
      link.download = `${business.business_name.replace(/\s+/g, "_")}-business-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading card:", error);
    } finally {
      setDownloading(false);
    }
  };

  // ✅ NEW: Share functionality
  const shareCard = async () => {
    setSharing(true);
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: `${business?.business_name} - Business Card`,
          text: `Check out ${business?.business_name}'s business profile`,
          url: url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setSharing(false);
    }
  };

  // Auto-download when ?download=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('download') === '1' && business) {
      setTimeout(() => { downloadPng(); }, 500);
    }
  }, [business]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "Business not found"}
            </h3>
            <p className="text-gray-600 mb-6">
              The business profile you're looking for doesn't exist or has been removed.
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AfterLoginNavbar />
      
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
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
                onClick={shareCard}
                disabled={sharing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                {sharing ? "Sharing..." : "Share"}
              </button>
              
              <button
                onClick={downloadPng}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Downloading..." : "Download PNG"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Business Card */}
            <div className="flex flex-col items-center">
              <div 
                ref={cardRef} 
                className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md mx-auto"
                style={{ aspectRatio: "3.5/2" }}
              >
                {/* Card Header */}
                <div className="p-8 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-center h-2/3 flex flex-col justify-center">
                  {business.logo_url ? (
                    <img 
                      src={business.logo_url} 
                      alt={business.business_name} 
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg" 
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white text-orange-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                      {business.business_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold leading-tight mb-2">
                    {business.business_name}
                  </h1>
                  
                  {business.industry && (
                    <p className="text-orange-100 text-sm font-medium">
                      {business.industry}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 text-gray-800 h-1/3 flex flex-col justify-center">
                  <div className="space-y-1 text-xs">
                    {business.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span>{business.mobile}</span>
                      </div>
                    )}
                    
                    {business.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="truncate">{business.email}</span>
                      </div>
                    )}
                    
                    {business.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-gray-500" />
                        <span className="text-blue-600 truncate">{business.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                {business.logo_url ? (
                  <img 
                    src={business.logo_url} 
                    alt={business.business_name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                    {business.business_name?.[0]?.toUpperCase()}
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {business.business_name}
                  </h2>
                  {business.industry && (
                    <p className="text-orange-600 font-medium">
                      {business.industry}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary */}
              {business.summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{business.summary}</p>
                </div>
              )}

              {/* Services */}
              {business.services && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Services</h3>
                  <p className="text-gray-600">{business.services}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {business.mobile && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{business.mobile}</p>
                      </div>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{business.email}</p>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Globe className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a 
                          href={business.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.address && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{business.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                {business.founded_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Founded</p>
                      <p className="font-medium">{business.founded_year}</p>
                    </div>
                  </div>
                )}

                {business.employee_count && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Team Size</p>
                      <p className="font-medium">{business.employee_count}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

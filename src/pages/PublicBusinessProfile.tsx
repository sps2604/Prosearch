import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Github, 
  MapPin,
  Download,
  Share2,
  ArrowLeft,
  Building2,
  Calendar,
  Users,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import AfterLoginNavbar from '../components/AfterLoginNavbar';
import Footer from '../components/footer';

interface BusinessProfile {
  id: string;
  business_name: string;
  industry?: string;
  logo_url?: string;
  website?: string;
  summary?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  github?: string;
  google_my_business?: string;
  address?: string;
  founded_year?: number;
  employee_count?: string;
  services?: string;
  created_at?: string;
}

const PublicBusinessProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!name) {
        setError("Business name not provided in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('business_name', decodeURIComponent(name))
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          setProfile(data);
        } else {
          setError("Business profile not found.");
        }
      } catch (err: any) {
        console.error("Error fetching business profile:", err);
        setError(`Failed to fetch business profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [name]);

  // ✅ NEW: Share functionality
  const shareProfile = async () => {
    setSharing(true);
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.business_name} - Business Profile`,
          text: `Check out ${profile?.business_name}'s business profile`,
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

  // ✅ NEW: Contact actions
  const handleContact = (type: string, value: string) => {
    switch (type) {
      case 'email':
        window.location.href = `mailto:${value}`;
        break;
      case 'phone':
      case 'whatsapp':
        window.location.href = `tel:${value}`;
        break;
      case 'website':
        window.open(value, '_blank');
        break;
      default:
        window.open(value, '_blank');
    }
  };

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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "Business profile not found"}
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

  // Get social media links
  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: profile.linkedin, color: 'text-blue-600' },
    { name: 'Instagram', icon: Instagram, url: profile.instagram, color: 'text-pink-600' },
    { name: 'Facebook', icon: Facebook, url: profile.facebook, color: 'text-blue-700' },
    { name: 'YouTube', icon: Youtube, url: profile.youtube, color: 'text-red-600' },
    { name: 'Twitter', icon: Twitter, url: profile.twitter, color: 'text-blue-400' },
    { name: 'GitHub', icon: Github, url: profile.github, color: 'text-gray-800' },
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
                onClick={shareProfile}
                disabled={sharing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                {sharing ? "Sharing..." : "Share"}
              </button>
              
              <a
                href={`/public-business-card/${encodeURIComponent(profile.business_name)}?download=1`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Card
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
                <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-amber-600 text-white py-12" ref={headerRef}>
                  <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.logo_url || ''} alt={`${profile.business_name} logo`} />
                    <AvatarFallback className="text-3xl font-bold text-orange-600 bg-white">
                      {profile.business_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-4xl font-bold mb-2">{profile.business_name}</CardTitle>
                  {profile.industry && (
                    <CardDescription className="text-xl text-orange-100 font-medium">
                      {profile.industry}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-8">
                  {/* Summary */}
                  {profile.summary && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-orange-600" />
                        About Us
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{profile.summary}</p>
                    </div>
                  )}

                  {/* Services */}
                  {profile.services && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Services</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.services}</p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.email && (
                        <button
                          onClick={() => handleContact('email', profile.email!)}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{profile.email}</p>
                          </div>
                        </button>
                      )}

                      {profile.mobile && (
                        <button
                          onClick={() => handleContact('phone', profile.mobile!)}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{profile.mobile}</p>
                          </div>
                        </button>
                      )}

                      {profile.whatsapp && (
                        <button
                          onClick={() => handleContact('whatsapp', profile.whatsapp!)}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">WhatsApp</p>
                            <p className="font-medium text-gray-900">{profile.whatsapp}</p>
                          </div>
                        </button>
                      )}

                      {profile.website && (
                        <button
                          onClick={() => handleContact('website', profile.website!)}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Globe className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Website</p>
                            <p className="font-medium text-blue-600 truncate">{profile.website}</p>
                          </div>
                        </button>
                      )}

                      {profile.address && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">{profile.address}</p>
                          </div>
                        </div>
                      )}

                      {profile.google_my_business && (
                        <button
                          onClick={() => handleContact('gmb', profile.google_my_business!)}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="p-2 bg-red-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Google My Business</p>
                            <p className="font-medium text-blue-600">View on Google</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Social Media Links */}
                  {socialLinks.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Connect With Us</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {socialLinks.map((social) => (
                          <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            <social.icon className={`h-5 w-5 ${social.color}`} />
                            <span className="font-medium text-gray-900 group-hover:text-blue-600">
                              {social.name}
                            </span>
                            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <Card className="shadow-sm rounded-xl border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.founded_year && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Founded</p>
                        <p className="font-medium">{profile.founded_year}</p>
                      </div>
                    </div>
                  )}

                  {profile.employee_count && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Team Size</p>
                        <p className="font-medium">{profile.employee_count}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-medium">{profile.industry || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="shadow-sm rounded-xl border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`/public-business-card/${encodeURIComponent(profile.business_name)}`}
                    className="block w-full text-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    View Business Card
                  </a>
                  
                  <a
                    href={`/public-business-card/${encodeURIComponent(profile.business_name)}?download=1`}
                    className="block w-full text-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    Download Card
                  </a>

                  {profile.email && (
                    <button
                      onClick={() => handleContact('email', profile.email!)}
                      className="block w-full text-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                    >
                      Send Email
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicBusinessProfile;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Phone, Mail, MapPin, Globe, Linkedin, ArrowLeft } from "lucide-react";

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

export default function PublicProfileCard() {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) {
        setError("Invalid profile link");
        setLoading(false);
        return;
      }

      try {
        // ✅ FIXED: Use limit(1) instead of single() to avoid errors
        const { data: userProfileData, error: userProfileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (userProfileError) {
          console.error("Database error:", userProfileError);
          setError("Error loading profile data");
        } else if (!userProfileData || userProfileData.length === 0) {
          setError("Profile not found");
        } else {
          setUserProfile(userProfileData[0] as UserProfile);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 text-sm mb-6">This profile may be private or no longer available.</p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );

  if (!userProfile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-4">
          <p className="text-lg text-gray-600">Profile not found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Public Profile Card - Same design as your ProfileCard */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header with Gradient */}
          <div 
            className="relative px-6 py-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #1d4ed8 100%)'
            }}
          >
            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: '#ffffff' }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: '#ffffff' 
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {userProfile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Name and Profession */}
            <h1 className="text-2xl font-bold text-center text-white mb-1">
              {userProfile.name}
            </h1>
            <p className="text-center text-white/90 text-sm">
              {userProfile.profession}
            </p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-6 bg-white">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-600">
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {userProfile.summary || `${userProfile.profession} with ${userProfile.experience || 'several'} years of experience. Skilled professional ready to deliver exceptional results.`}
              </p>
            </div>

            {/* Skills Section */}
            {userProfile.skills && (
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2 text-gray-900">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {userProfile.skills.split(',').slice(0, 6).map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {userProfile.mobile && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm">{userProfile.mobile}</span>
                </div>
              )}

              {userProfile.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 rounded-full bg-red-100">
                    <Mail size={16} className="text-red-600" />
                  </div>
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              )}

              {userProfile.address && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 rounded-full bg-green-100">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm">{userProfile.address}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-center gap-4">
                {userProfile.linkedin && (
                  <a
                    href={userProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-3 rounded-full transition-colors bg-blue-600 hover:bg-blue-700"
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {userProfile.website && (
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-3 rounded-full transition-colors bg-gray-600 hover:bg-gray-700"
                  >
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">Powered by Softcadd</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-6 text-center bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-4">Want to create your own professional profile?</p>
          <a 
            href="/register" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your Profile
          </a>
        </div>
      </div>
    </div>
  );
}

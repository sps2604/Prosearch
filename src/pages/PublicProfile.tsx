import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Github
} from "lucide-react";

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

export default function PublicProfile() {
  const { name } = useParams<{ name: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!name) {
        setError("Profile name not provided");
        setLoading(false);
        return;
      }

      try {
        // Normalize name to be case-insensitive and trimmed
        const raw = decodeURIComponent(name);
        const normalizedName = raw.trim();
        // Fetch profile by case-insensitive name match; avoid 406 by not using .single()
        const { data, error: userProfileError } = await supabase
          .from("user_profiles")
          .select("*")
          .ilike("name", normalizedName)
          .limit(1);

        if (userProfileError) {
          if (userProfileError.code === 'PGRST116') {
            setError("Profile not found");
          } else {
            setError("Error fetching profile: " + userProfileError.message);
          }
        } else {
          const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
          if (!first) {
            setError("Profile not found");
          } else {
            setUserProfile(first as UserProfile);
          }
        }
      } catch (err) {
        setError("Unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [name]);

  // Intentionally minimal public view: action handlers removed

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-xl text-red-600 mb-2">Oops!</p>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!userProfile) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <p className="text-center text-lg text-gray-600">No profile found</p>
    </div>
  );

  // Social links rendered inline below when present

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Gradient (match card view) */}
          <div 
            className="relative px-6 py-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #1d4ed8 100%)'
            }}
          >
            <div className="flex justify-center mb-4">
              {userProfile.logo_url ? (
                <img
                  src={userProfile.logo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: '#ffffff' }}
                  crossOrigin="anonymous"
                  loading="eager"
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

            <h1 className="text-2xl font-bold text-center text-white mb-1">
              {userProfile.name}
            </h1>
            <p className="text-center text-white text-sm opacity-90">
              {userProfile.profession}
            </p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="mb-6">
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: '#2563eb' }}
              >
                Professional Summary
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#374151' }}
              >
                {userProfile.summary ||
                  `${userProfile.profession} with ${userProfile.experience} years of experience. Skilled professional ready to deliver exceptional results.`}
              </p>
            </div>

            <div className="space-y-3">
              {userProfile.mobile && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: '#374151' }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: '#dbeafe' }}
                  >
                    <Phone size={16} style={{ color: '#2563eb' }} />
                  </div>
                  <span className="text-sm">{userProfile.mobile}</span>
                </div>
              )}

              {userProfile.email && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: '#374151' }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: '#fee2e2' }}
                  >
                    <Mail size={16} style={{ color: '#dc2626' }} />
                  </div>
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              )}

              {userProfile.address && (
                <div
                  className="flex items-center gap-3"
                  style={{ color: '#374151' }}
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: '#dcfce7' }}
                  >
                    <MapPin size={16} style={{ color: '#059669' }} />
                  </div>
                  <span className="text-sm">{userProfile.address}</span>
                </div>
              )}
            </div>

            <div
              className="mt-6 pt-4"
              style={{ borderTop: '1px solid #f3f4f6' }}
            >
              <div className="flex justify-between items-center">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: '#1f2937' }}
                >
                  Social Media
                </h3>
              </div>

              <div className="flex gap-2 mt-2">
                {userProfile.linkedin && (
                  <a
                    href={userProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white p-2 rounded-full transition-colors"
                    style={{ backgroundColor: '#2563eb' }}
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
                    style={{ backgroundColor: '#4b5563' }}
                  >
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </div>

            <div
              className="mt-4 pt-4 text-center"
              style={{ borderTop: '1px solid #f3f4f6' }}
            >
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                Powered by Softcadd
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { FaUser, FaAddressBook, FaLink, FaUpload, FaTimes } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";

type Tab = "personal" | "contact" | "links";

export default function CreateProfile() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string>("");
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    logo_url: "",
    experience: "",
    languages: "",
    skills: "",
    address: "",
    summary: "",
    mobile: "",
    whatsapp: "",
    email: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
    twitter: "",
    github: "",
    website: "",
    google_my_business: "",
  });

  // ✅ FIXED: Better session verification with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const verifySession = async () => {
      try {
        console.log('=== VERIFYING SESSION ===');
        
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.log('❌ Session verification timeout');
          setAuthError("Session verification timeout. Please try logging in again.");
          setAuthLoading(false);
        }, 10000); // 10 second timeout

        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error: sessionError?.message 
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          clearTimeout(timeoutId);
          setAuthError("Authentication error. Please login again.");
          setAuthLoading(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!session) {
          console.log('No session found');
          clearTimeout(timeoutId);
          setAuthError("No active session. Redirecting to login...");
          setAuthLoading(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Check if user already has a profile
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (existingProfile) {
          console.log('User already has profile, redirecting...');
          clearTimeout(timeoutId);
          navigate('/profile');
          return;
        }

        console.log('✅ Session verified successfully');
        clearTimeout(timeoutId);
        setAuthLoading(false);

      } catch (error) {
        console.error('Session verification error:', error);
        clearTimeout(timeoutId);
        setAuthError("Unexpected authentication error.");
        setAuthLoading(false);
      }
    };

    verifySession();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  // ✅ SIMPLIFIED: Auth state change handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, !!session);
        
        if (event === 'SIGNED_IN' && session && authLoading) {
          console.log('✅ User signed in via auth state change');
          setAuthLoading(false);
          setAuthError("");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [authLoading]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    const fileInput = document.getElementById('profile-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const uploadProfileImage = async (userId: string): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      console.log('Starting upload for user:', userId);
      
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const {error } = await supabase.storage
        .from('profiles')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const goNext = () => {
    if (activeTab === "personal") setActiveTab("contact");
    else if (activeTab === "contact") setActiveTab("links");
  };

  const goPrevious = () => {
    if (activeTab === "links") setActiveTab("contact");
    else if (activeTab === "contact") setActiveTab("personal");
  };

  // ✅ FIXED: Proper null handling for currentUser
  const handleSubmit = async () => {
    try {
      console.log('=== STARTING FORM SUBMISSION ===');
      setUploading(true);

      // Get fresh user data
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("❌ User fetch error:", userError);
        alert("Authentication error. Please try logging in again.");
        navigate('/login');
        return;
      }

      // ✅ FIXED: Explicit null check
      if (!user) {
        console.error("❌ No user found");
        alert("No authenticated user found. Please login again.");
        navigate('/login');
        return;
      }

      // Now TypeScript knows user is not null
      const currentUser = user;
      console.log('✅ User authenticated:', currentUser.id);

      // Handle image upload
      let profileImageUrl: string | null = formData.logo_url.trim() || null;

      if (uploadMode === "upload" && selectedFile) {
        console.log('📤 Uploading image...');
        try {
          const uploadedUrl = await uploadProfileImage(currentUser.id);
          if (uploadedUrl) {
            profileImageUrl = uploadedUrl;
            console.log('✅ Image uploaded:', uploadedUrl);
          } else {
            alert("Failed to upload profile image. Please try again.");
            return;
          }
        } catch (error) {
          console.error("❌ Upload error:", error);
          alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      }

      // Prepare profile data
      const profileData = {
        user_id: currentUser.id,
        name: formData.name.trim(),
        profession: formData.profession.trim(),
        logo_url: profileImageUrl,
        experience: formData.experience ? parseInt(formData.experience) : null,
        languages: formData.languages.trim() || null,
        skills: formData.skills.trim() || null,
        address: formData.address.trim() || null,
        summary: formData.summary.trim() || null,
        mobile: formData.mobile.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        email: formData.email.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        instagram: formData.instagram.trim() || null,
        facebook: formData.facebook.trim() || null,
        youtube: formData.youtube.trim() || null,
        twitter: formData.twitter.trim() || null,
        github: formData.github.trim() || null,
        website: formData.website.trim() || null,
        google_my_business: formData.google_my_business.trim() || null,
      };

      console.log('💾 Saving profile...');
      
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert([profileData]);

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        
        if (insertError.code === '23505') {
          alert("Profile already exists. Redirecting...");
          navigate("/profile");
          return;
        }
        
        alert(`Failed to create profile: ${insertError.message}`);
        return;
      }

      console.log('✅ Profile created successfully');
      alert("Profile created successfully!");
      navigate("/profile");

    } catch (error) {
      console.error("❌ Unexpected error:", error);
      alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ ADD: Debug button for testing (remove in production)
  const debugAuth = async () => {
    console.log('=== DEBUG AUTH ===');
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('Session:', session);
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('Email confirmed:', user?.email_confirmed_at);
    
    alert(`Debug - Session: ${!!session}, User: ${!!user}, ID: ${user?.id}`);
  };

  const tabClass = (tab: Tab) =>
    `flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-t-xl cursor-pointer transition-all font-medium text-xs sm:text-sm
     ${activeTab === tab 
       ? "bg-blue-600 text-white shadow-lg" 
       : "bg-gray-100 text-gray-600 hover:bg-gray-200"
     }`;

  // Loading state with timeout message
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 mb-2">Verifying authentication...</p>
            <p className="text-sm text-gray-500">This should only take a few seconds</p>
            
            {/* ✅ ADD: Debug button and force continue option */}
            <div className="mt-6 space-y-2">
              <button
                onClick={debugAuth}
                className="text-sm text-blue-600 hover:underline"
              >
                Debug Auth State
              </button>
              <br />
              <button
                onClick={() => {
                  setAuthLoading(false);
                  setAuthError("");
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Force Continue (Skip Verification)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md mx-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{authError}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={debugAuth}
                className="w-full text-sm text-blue-600 hover:underline"
              >
                Debug Auth State
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <AfterLoginNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Tabs */}
        <div className="flex justify-center mt-2 sm:mt-6 space-x-1 sm:space-x-2 mb-4 sm:mb-0">
          <div className={tabClass("personal")} onClick={() => setActiveTab("personal")}>
            <FaUser className="text-sm sm:text-base" />
            <span className="hidden xs:inline sm:inline">Personal</span>
          </div>
          <div className={tabClass("contact")} onClick={() => setActiveTab("contact")}>
            <FaAddressBook className="text-sm sm:text-base" />
            <span className="hidden xs:inline sm:inline">Contact</span>
          </div>
          <div className={tabClass("links")} onClick={() => setActiveTab("links")}>
            <FaLink className="text-sm sm:text-base" />
            <span className="hidden xs:inline sm:inline">Links</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-xl w-full max-w-2xl mx-auto mt-4 sm:mt-8 rounded-2xl p-4 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
            Create Professional Profile
          </h2>

          {/* Personal Details */}
          {activeTab === "personal" && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Name:</label>
                <input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter full name or business name"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Profession / Services:</label>
                <input
                  value={formData.profession}
                  onChange={(e) => handleChange("profession", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="e.g. Digital Marketing, Photography"
                />
              </div>

              {/* Profile Image Upload Section */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Profile Photo:</label>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMode("upload")}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                      uploadMode === "upload" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FaUpload className="text-xs sm:text-sm" />
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                      uploadMode === "url" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FaLink className="text-xs sm:text-sm" />
                    Use URL
                  </button>
                </div>

                {uploadMode === "upload" && (
                  <div className="space-y-4">
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-8 text-center hover:border-blue-400 transition-colors">
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="profile-image" className="cursor-pointer">
                          <FaUpload className="mx-auto text-2xl sm:text-4xl text-gray-400 mb-2 sm:mb-4" />
                          <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Click to upload profile photo</p>
                          <p className="text-xs sm:text-sm text-gray-400">JPEG, PNG, WebP (Max 5MB)</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border-4 border-white shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <FaTimes size={10} className="sm:text-xs" />
                        </button>
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-32 truncate">{selectedFile.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {uploadMode === "url" && (
                  <input
                    value={formData.logo_url}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Enter image URL"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Experience (Years):</label>
                <input
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="e.g. 5"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Languages Known:</label>
                <input
                  value={formData.languages}
                  onChange={(e) => handleChange("languages", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="e.g. English, Hindi"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Skills:</label>
                <input
                  value={formData.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="e.g. Web Development, Graphic Design"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Address:</label>
                <input
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your full address"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Professional Summary:</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm h-20 sm:h-28 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                  placeholder="Brief about you, your background and goals"
                />
              </div>
            </div>
          )}

          {/* Contact Details */}
          {activeTab === "contact" && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Mobile:</label>
                <input
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter contact number"
                  inputMode="tel"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">WhatsApp:</label>
                <input
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter active WhatsApp number"
                  inputMode="tel"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">Email:</label>
                <input
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter professional or business email"
                  inputMode="email"
                />
              </div>
            </div>
          )}

          {/* Accounts & Links */}
          {activeTab === "links" && (
            <div className="space-y-4 sm:space-y-5">
              {[
                ["linkedin", "LinkedIn"],
                ["instagram", "Instagram"],
                ["facebook", "Facebook"],
                ["youtube", "YouTube"],
                ["twitter", "Twitter"],
                ["github", "GitHub"],
                ["website", "Website / Portfolio"],
                ["google_my_business", "Google My Business Link"],
              ].map(([field, label], index) => (
                <div key={index}>
                  <label className="block font-semibold text-gray-700 mb-1 text-sm sm:text-base">{label}:</label>
                  <input
                    value={(formData as any)[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder={`Enter ${label} link`}
                    inputMode="url"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
            {activeTab !== "personal" && (
              <button
                onClick={goPrevious}
                disabled={uploading}
                className="order-2 sm:order-1 border border-gray-400 text-gray-700 px-4 sm:px-6 py-2 sm:py-2 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 text-sm sm:text-base"
              >
                Previous
              </button>
            )}

            {activeTab !== "links" ? (
              <button
                onClick={goNext}
                disabled={uploading}
                className="order-1 sm:order-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-xl shadow-md hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base sm:ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="order-1 sm:order-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-xl shadow-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base sm:ml-auto"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    Creating Profile...
                  </>
                ) : (
                  "Create Profile"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

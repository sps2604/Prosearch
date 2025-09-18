import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { FaUser, FaAddressBook, FaLink, FaUpload, FaTimes } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext"; // ✅ ADDED

type Tab = "personal" | "contact" | "links";

export default function CreateBusinessProfile() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loadingUserType, setLoadingUserType] = useState(true);
  const navigate = useNavigate();
  const { setProfile } = useUser(); // ✅ ADDED

  const [formData, setFormData] = useState({
    business_name: "",
    industry: "",
    logo_url: "",
    website: "",
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
    google_my_business: "",
  });

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          navigate("/login");
          return;
        }
        
        if (user) {
          console.log("Checking user type for:", user.id);
          
          // FIRST: Check if business profile already exists
          const { data: existingBusiness, error: businessError } = await supabase
            .from("businesses")
            .select("id, business_name")
            .eq("user_id", user.id) // ✅ FIXED: Use user_id
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (businessError && businessError.code !== 'PGRST116') {
            console.error("Error checking existing business:", businessError);
          }
          
          if (existingBusiness?.[0]) { // ✅ FIXED: Array access
            console.log("Business profile already exists, redirecting to view profile");
            navigate("/business-profile");
            return;
          }
          
          // SECOND: Check if user is a professional (should go to professional profile creation instead)
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error checking user profile:", profileError);
          }
          
          if (profileData?.[0]?.user_type === "professional") { // ✅ FIXED: Array access
            console.log("User is professional type, redirecting to create professional profile");
            navigate("/create-profile");
            return;
          }
          
          // THIRD: If no business profile exists and user is not professional, allow business profile creation
          console.log("No existing business profile found, allowing creation");
          setLoadingUserType(false);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Unexpected error in checkUserType:", error);
        navigate("/login");
      }
    };

    checkUserType();
  }, [navigate]);

  if (loadingUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <p className="text-lg text-gray-700">Loading business profile...</p>
      </div>
    );
  }

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
    const fileInput = document.getElementById('business-logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const uploadBusinessLogo = async (userId: string): Promise<string | null> => {
    if (!selectedFile) return null;
    
    try {
      console.log('Starting business logo upload for user:', userId);
      
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}-business-${Date.now()}.${fileExt}`;
      const filePath = `business-logos/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { data, error } = await supabase.storage
        .from('profiles') // Use same bucket as professional profiles
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading business logo:', error);
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

  const handleSubmit = async () => {
    try {
      console.log('Starting form submission...');
      setUploading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User fetch error:", userError);
        alert("You must be logged in to create a business profile.");
        return;
      }

      console.log('User authenticated:', user.id);

      // Check if business profile already exists
      const { data: existingBusiness, error: checkError } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id) // ✅ FIXED: Use user_id
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing business:", checkError);
        alert("Error checking existing profile. Please try again.");
        return;
      }

      if (existingBusiness?.[0]) { // ✅ FIXED: Array access
        alert("You already have a business profile. Redirecting to your profile.");
        navigate("/business-profile");
        return;
      }

      let logoImageUrl: string | null = formData.logo_url.trim() || null;

      if (uploadMode === "upload" && selectedFile) {
        console.log('Upload mode: file upload');
        try {
          const uploadedUrl = await uploadBusinessLogo(user.id);
          if (uploadedUrl) {
            logoImageUrl = uploadedUrl;
            console.log('Business logo uploaded successfully:', uploadedUrl);
          } else {
            console.error('Upload returned null');
            alert("Failed to upload business logo. Please try again.");
            return;
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert(`Failed to upload business logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      } else if (uploadMode === "upload" && !selectedFile) {
        logoImageUrl = null;
        console.log('Upload mode but no file selected');
      } else {
        console.log('URL mode:', logoImageUrl);
      }

      console.log('Saving business profile to database...');
      
      const { error } = await supabase.from("businesses").insert([
        {
          user_id: user.id, // ✅ FIXED: Use user_id instead of id
          business_name: formData.business_name,
          industry: formData.industry,
          logo_url: logoImageUrl,
          website: formData.website,
          summary: formData.summary,
          mobile: formData.mobile,
          whatsapp: formData.whatsapp,
          email: formData.email,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
          youtube: formData.youtube,
          twitter: formData.twitter,
          github: formData.github,
          google_my_business: formData.google_my_business,
          user_type: 'business',
        },
      ]);

      if (error) {
        console.error("Database insert error:", error);
        alert(`Failed to save business profile: ${error.message}`);
      } else {
        console.log('Business profile saved successfully');
        
        // ✅ ADDED: UPDATE USER CONTEXT AFTER SUCCESSFUL CREATION
        setProfile({
          id: user.id,
          business_name: formData.business_name,
          email: user.email || formData.email,
          user_type: "business",
        });
        
        console.log('UserContext updated with business profile');
        alert("Business profile created successfully!");
        navigate("/business-profile");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      console.log('Setting uploading to false');
      setUploading(false);
    }
  };

  const tabClass = (tab: Tab) =>
    `flex items-center gap-2 px-6 py-2 rounded-t-xl cursor-pointer transition-all font-medium
     ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <AfterLoginNavbar />

      {/* Tabs */}
      <div className="flex justify-center mt-6 space-x-2">
        <div className={tabClass("personal")} onClick={() => setActiveTab("personal")}>
          <FaUser /> Business Info
        </div>
        <div className={tabClass("contact")} onClick={() => setActiveTab("contact")}>
          <FaAddressBook /> Contact
        </div>
        <div className={tabClass("links")} onClick={() => setActiveTab("links")}>
          <FaLink /> Links
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white shadow-xl max-w-2xl mx-auto mt-8 rounded-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Create Business Profile
        </h2>

        {/* Business Info */}
        {activeTab === "personal" && (
          <div className="space-y-5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Business Name:</label>
              <input
                value={formData.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Industry:</label>
              <input
                value={formData.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="e.g. Technology, Food & Beverage, Consulting"
              />
            </div>

            {/* Business Logo Upload Section */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">Business Logo:</label>
              
              {/* Upload Mode Toggle */}
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMode("upload")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadMode === "upload" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaUpload className="inline mr-2" />
                  Upload Logo
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadMode === "url" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaLink className="inline mr-2" />
                  Use URL
                </button>
              </div>

              {/* Upload Mode */}
              {uploadMode === "upload" && (
                <div className="space-y-4">
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="business-logo"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="business-logo" className="cursor-pointer">
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload business logo</p>
                        <p className="text-sm text-gray-400">JPEG, PNG, WebP (Max 5MB)</p>
                      </label>
                    </div>
                  ) : selectedFile && previewUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <FaTimes size={12} />
                      </button>
                      <p className="text-sm text-gray-600 mt-2">{selectedFile.name}</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* URL Mode */}
              {uploadMode === "url" && (
                <input
                  value={formData.logo_url}
                  onChange={(e) => handleChange("logo_url", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter logo image URL"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Website:</label>
              <input
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="e.g. https://www.yourbusiness.com"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Business Summary:</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm h-28 focus:outline-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Brief about your business, services and mission"
              />
            </div>
          </div>
        )}

        {/* Contact Details */}
        {activeTab === "contact" && (
          <div className="space-y-5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mobile:</label>
              <input
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">WhatsApp:</label>
              <input
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter active WhatsApp number"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email:</label>
              <input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter business email"
              />
            </div>
          </div>
        )}

        {/* Accounts & Links */}
        {activeTab === "links" && (
          <div className="space-y-5">
            {[
              ["linkedin", "LinkedIn"],
              ["instagram", "Instagram"],
              ["facebook", "Facebook"],
              ["youtube", "YouTube"],
              ["twitter", "Twitter"],
              ["github", "GitHub"],
              ["google_my_business", "Google My Business Link"],
            ].map(([field, label], index) => (
              <div key={index}>
                <label className="block font-semibold text-gray-700 mb-1">{label}:</label>
                <input
                  value={(formData as any)[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder={`Enter ${label} link`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          {activeTab !== "personal" && (
            <button
              onClick={goPrevious}
              disabled={uploading}
              className="border border-gray-400 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            >
              Previous
            </button>
          )}

          {activeTab !== "links" ? (
            <button
              onClick={goNext}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-700 transition ml-auto disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-700 transition ml-auto disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

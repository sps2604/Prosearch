import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function LoginRedirect() {
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        console.log("LoginRedirect: Starting auth redirect handling...");

        // Get the current URL to extract user_type
        const urlParams = new URLSearchParams(window.location.search);
        const userTypeFromUrl = urlParams.get('user_type'); // professional or business
        
        console.log("LoginRedirect: User type from URL:", userTypeFromUrl);

        // Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("LoginRedirect: No authenticated user found");
          navigate("/login");
          return;
        }

        console.log("LoginRedirect: User authenticated:", user.id);

        // ✅ FIXED: Check if user already has a profile in either table with proper null checks
        const [professionalResult, businessResult] = await Promise.all([
          supabase.from("user_profiles").select("user_type").eq("user_id", user.id).limit(1),
          supabase.from("businesses").select("user_type").eq("user_id", user.id).limit(1)
        ]);

        // ✅ FIXED: Safe null checking with proper TypeScript
        const hasProfessionalProfile = professionalResult.data && professionalResult.data.length > 0;
        const hasBusinessProfile = businessResult.data && businessResult.data.length > 0;
        const hasProfile = hasProfessionalProfile || hasBusinessProfile;

        console.log("LoginRedirect: Profile check:", { 
          hasProfessionalProfile, 
          hasBusinessProfile, 
          hasProfile 
        });

        if (hasProfile) {
          // User already has a profile, determine type and redirect to dashboard
          const userType = hasProfessionalProfile ? "professional" : "business";
          
          console.log("LoginRedirect: Existing user with profile type:", userType);
          
          // Update UserContext
          if (userType === "professional") {
            setProfile({
              id: user.id,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              email: user.email || '',
              user_type: "professional",
            });
            navigate("/profile");
          } else {
            setProfile({
              id: user.id,
              business_name: user.user_metadata?.business_name || '',
              email: user.email || '',
              user_type: "business",
            });
            navigate("/business-profile");
          }
        } else {
          // New user, needs to create profile
          console.log("LoginRedirect: New user, needs profile creation");

          if (userTypeFromUrl === "professional") {
            // Create empty professional profile record
            const { error: insertError } = await supabase
              .from("user_profiles")
              .insert([{
                user_id: user.id,
                name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || '',
                user_type: "professional",
                profession: "",
                experience: 0,
                languages: "",
                skills: "",
                address: "",
                summary: "",
                mobile: "",
                whatsapp: "",
                email: user.email || '',
                linkedin: "",
                instagram: "",
                facebook: "",
                youtube: "",
                twitter: "",
                github: "",
                website: "",
                google_my_business: ""
              }]);

            if (insertError) {
              console.error("Error creating professional profile:", insertError);
            } else {
              console.log("LoginRedirect: Professional profile record created");
            }

            // Set user context as professional
            setProfile({
              id: user.id,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              email: user.email || '',
              user_type: "professional",
            });

            navigate("/create-profile");
          } else if (userTypeFromUrl === "business") {
            // Create empty business profile record
            const { error: insertError } = await supabase
              .from("businesses")
              .insert([{
                user_id: user.id,
                business_name: user.user_metadata?.business_name || user.user_metadata?.name || '',
                user_type: "business",
                industry: "",
                logo_url: "",
                website: "",
                summary: "",
                mobile: "",
                whatsapp: "",
                email: user.email || '',
                linkedin: "",
                instagram: "",
                facebook: "",
                youtube: "",
                twitter: "",
                github: "",
                google_my_business: ""
              }]);

            if (insertError) {
              console.error("Error creating business profile:", insertError);
            } else {
              console.log("LoginRedirect: Business profile record created");
            }

            // Set user context as business
            setProfile({
              id: user.id,
              business_name: user.user_metadata?.business_name || user.user_metadata?.name || '',
              email: user.email || '',
              user_type: "business",
            });

            navigate("/create-business-profile");
          } else {
            // No user type specified, redirect to selection
            console.log("LoginRedirect: No user type specified, redirecting to selection");
            navigate("/register");
          }
        }
      } catch (error) {
        console.error("LoginRedirect: Error in auth redirect:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthRedirect();
  }, [navigate, setProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Setting up your account...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we configure your profile...</p>
        </div>
      </div>
    );
  }

  return null;
}

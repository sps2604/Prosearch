import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext'; // Import useUser

export default function LoginRedirect() {
  const navigate = useNavigate();
  const { setProfile } = useUser(); // Use setProfile from context

  useEffect(() => {
    const handleRedirect = async () => {
      console.log("LoginRedirect: Starting handleRedirect...");
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("LoginRedirect: Error fetching user after redirect:", error);
        navigate("/login"); // Redirect to login if user not found
        return;
      }

      if (user) {
        console.log("LoginRedirect: User found:", user.id);
        
        // ✅ FIXED: Fetch user_type from database tables with proper typing
        let userType: "professional" | "business" | undefined = "professional"; // default fallback
        
        // Try to get user_type from user_profiles first
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("user_type, name")
          .eq("user_id", user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (profileData?.[0]?.user_type) {
          // ✅ Type assertion to ensure correct type
          userType = profileData[0].user_type as "professional" | "business";
          console.log("LoginRedirect: User type from user_profiles:", userType);
        } else {
          // If not found in user_profiles, try businesses table
          const { data: businessData } = await supabase
            .from("businesses")
            .select("user_type, business_name")
            .eq("id", user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (businessData?.[0]?.user_type) {
            // ✅ Type assertion to ensure correct type
            userType = businessData[0].user_type as "professional" | "business";
            console.log("LoginRedirect: User type from businesses:", userType);
          }
        }

        // Set the user profile in context
        setProfile({
          id: user.id, // Include the user ID
          first_name: user.user_metadata?.first_name || profileData?.[0]?.name?.split(' ')[0],
          last_name: user.user_metadata?.last_name || profileData?.[0]?.name?.split(' ').slice(1).join(' '),
          business_name: user.user_metadata?.business_name,
          email: user.email,
          user_type: userType, // ✅ Now properly typed
        });

        console.log("LoginRedirect: Profile set in context. Navigating to /home2...");
        navigate("/home2?justLoggedIn=true");
      } else {
        console.warn("LoginRedirect: No user found after login redirect, redirecting to login.");
        navigate("/login");
      }
    };

    handleRedirect();
  }, [navigate, setProfile]); // Add setProfile to dependency array

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-700">Processing login, please wait...</p>
    </div>
  );
}

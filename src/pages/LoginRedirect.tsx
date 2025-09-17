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
        const userType = user.user_metadata?.user_type || "professional"; // Add fallback to 'professional'
        console.log("LoginRedirect: User type:", userType);

        // Set the user profile in context
        setProfile({
          id: user.id, // Include the user ID
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          email: user.email,
          user_type: userType,
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

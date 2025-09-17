import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import { supabase } from "../lib/supabaseClient";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import LoginIllustration from "../assets/login-illustration.svg";
import { useUser } from "../context/UserContext"; // Import useUser

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setProfile } = useUser(); // Destructure setProfile here

  // Email + Password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    console.log("🚀 Trying to login with", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("🔑 Supabase response:", { data, error });
    setLoading(false);

    if (error) {
      setError(error.message);
      console.error("❌ Login failed:", error.message);
    } else if (data?.user && data?.session) {   // ✅ add this check
      console.log("✅ Login success", data);

      // Fetch user_type from database tables
      let userType = "professional"; // default fallback
      
      // Try to get user_type from user_profiles first
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("user_type, name")
        .eq("user_id", data.user.id)
        .single();
      
      if (profileData?.user_type) {
        userType = profileData.user_type;
        console.log("Login: User type from user_profiles:", userType);
      } else {
        // If not found in user_profiles, try businesses table
        const { data: businessData } = await supabase
          .from("businesses")
          .select("user_type, business_name")
          .eq("id", data.user.id)
          .single();
        
        if (businessData?.user_type) {
          userType = businessData.user_type;
          console.log("Login: User type from businesses:", userType);
        }
      }

      // Set the user profile in context
      setProfile({
        id: data.user.id, // Include the user ID
        first_name: data.user.user_metadata?.first_name || profileData?.name?.split(' ')[0],
        last_name: data.user.user_metadata?.last_name || profileData?.name?.split(' ').slice(1).join(' '),
        business_name: data.user.user_metadata?.business_name,
        email: data.user.email,
        user_type: userType,
      });

      // Revert to /home2 redirection as requested
      navigate("/home2?justLoggedIn=true");
    } else {
      setError("No active session returned. Check your Supabase settings.");
      console.warn("⚠️ Login response missing session:", data);
    }
  };


  // Magic Link login
  const handleMagicLink = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login-redirect`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("📩 Magic Link sent! Check your email.");
    }
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login-redirect`,
        },
      });
      if (error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("📩 Password reset link sent! Check your email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl gap-8 p-8">
          {/* Left Illustration */}
          <div className="flex justify-center items-center">
            <img
              src={LoginIllustration}
              alt="Login Illustration"
            />
          </div>

          {/* Right Login Form */}
          <div className="bg-white shadow-lg rounded-xl p-8 w-full">
            <h2 className="text-2xl font-bold mb-2">Login to your Digital CV</h2>
            <p className="text-gray-500 mb-6">Build. Share. Get Hired</p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                id="email"
                name="email" // Add name attribute
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-md px-3 py-2 mb-4"
              />
              <input
                type="password"
                id="password"
                name="password" // Add name attribute
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-md px-3 py-2 mb-4"
              />

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              {message && <p className="text-green-500 text-sm mb-2">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p
              onClick={handleForgotPassword}
              className="text-right text-sm mt-2 text-blue-500 cursor-pointer hover:underline"
            >
              Forgotten password?
            </p>

            {/* Create Account */}
            <Link
              to="/register"
              className="block text-center w-full border border-blue-500 text-blue-500 hover:bg-blue-50 py-2 rounded-md mt-4"
            >
              Create New Account
            </Link>

            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="px-2 text-gray-400 text-sm">Or continue with</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Magic Link Login */}
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border rounded-md py-2 mb-3 transition duration-200 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50"
            >
              <FaEnvelope className="text-black-700" />
              Login with email
            </button>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border rounded-md py-2 
             transition duration-200 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50"
            >
              <FaGoogle className="text-red-500" />
              Login with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

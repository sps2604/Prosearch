import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import { supabase } from "../lib/supabaseClient";
import { FaGoogle, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import LoginIllustration from "../assets/login-illustration.svg";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setProfile } = useUser();

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
    } else if (data?.user && data?.session) {
      console.log("✅ Login success", data);

      // Fetch user_type from database tables with proper typing
      let userType: "professional" | "business" | undefined = "professional";
      
      // Try to get user_type from user_profiles first
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("user_type, name")
        .eq("user_id", data.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (profileData?.[0]?.user_type) {
        userType = profileData[0].user_type as "professional" | "business";
        console.log("Login: User type from user_profiles:", userType);
      } else {
        // If not found in user_profiles, try businesses table
        const { data: businessData } = await supabase
          .from("businesses")
          .select("user_type, business_name")
          .eq("user_id", data.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (businessData?.[0]?.user_type) {
          userType = businessData[0].user_type as "professional" | "business";
          console.log("Login: User type from businesses:", userType);
        }
      }

      // Set the user profile in context
      setProfile({
        id: data.user.id,
        first_name: data.user.user_metadata?.first_name || profileData?.[0]?.name?.split(' ')[0],
        last_name: data.user.user_metadata?.last_name || profileData?.[0]?.name?.split(' ').slice(1).join(' '),
        business_name: data.user.user_metadata?.business_name,
        email: data.user.email,
        user_type: userType,
      });

      navigate("/home2?justLoggedIn=true");
    } else {
      setError("No active session returned. Check your Supabase settings.");
      console.warn("⚠️ Login response missing session:", data);
    }
  };

  // Magic Link login
  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    
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
      setMessage("📩 Magic Link sent! Check your email and click the link to login.");
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
      setError("Please enter your email address first.");
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
      setMessage("📩 Password reset link sent! Check your email for instructions.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AuthNavbar />
      
      <div className="flex flex-1 items-center justify-center py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl gap-8">
          {/* Left Illustration */}
          <div className="hidden lg:flex justify-center items-center bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="text-center">
              <img
                src={LoginIllustration}
                alt="Login Illustration"
                className="max-w-full h-auto"
              />
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Connect with opportunities and build your professional network</p>
              </div>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Login to your Account</h1>
              <p className="text-gray-600">Build. Share. Get Hired</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  "Login to Account"
                )}
              </button>
            </form>

            {/* Forgot Password */}
            <div className="text-right mt-4">
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Forgotten password?
              </button>
            </div>

            {/* Create Account */}
            <Link
              to="/register"
              className="block text-center w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg mt-6 font-medium transition-colors"
            >
              Create New Account
            </Link>

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr className="flex-1 border-gray-300" />
              <span className="px-4 text-gray-500 text-sm font-medium">Or continue with</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Alternative Login Methods */}
            <div className="space-y-3">
              {/* Magic Link Login */}
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaEnvelope className="text-gray-600" />
                Login with Magic Link
              </button>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaGoogle className="text-red-500" />
                Login with Google
              </button>
            </div>

            {/* Terms and Privacy */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

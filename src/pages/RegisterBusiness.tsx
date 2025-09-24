import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Eye, EyeOff } from "lucide-react"; // ✅ ADDED: Eye icons
import registerIllustration from "../assets/register-illustration.svg";
import googleIcon from "../assets/google-icon.png";
import emailIcon from "../assets/email-icon.webp";
import Navbar from "../components/BeforeLoginNavbar";
import { supabase } from "../lib/supabaseClient";

export default function RegisterBusiness() {
  const navigate = useNavigate();
  
  // State for form
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ ADDED: Confirm password
  const [showPassword, setShowPassword] = useState(false); // ✅ ADDED: Password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ ADDED: Confirm password visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ ADDED: Password validation
  const validatePasswords = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Handle Register with email + password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    // ✅ ADDED: Validate passwords before submission
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Starting business registration...');

      const userData = {
        business_name: businessName,
        user_type: "business",
      };

      // Sign up user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/create-business-profile`,
        },
      });

      if (signUpError) {
        console.error('SignUp Error:', signUpError);
        throw signUpError;
      }

      console.log('Business SignUp successful:', data);

      // Create business profile record immediately
      if (data.user) {
        const { error: businessError } = await supabase
          .from("businesses")
          .insert([{
            user_id: data.user.id,
            business_name: businessName,
            user_type: "business",
            industry: "",
            logo_url: "",
            website: "",
            summary: "",
            mobile: "",
            whatsapp: "",
            email: email,
            linkedin: "",
            instagram: "",
            facebook: "",
            youtube: "",
            twitter: "",
            github: "",
            google_my_business: ""
          }]);
        if (businessError) console.error('Business creation error:', businessError);
      }

      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        setMessage("📩 Registration successful! Please check your email to confirm your account.");
      } else if (data.user && data.user.email_confirmed_at) {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => {
          navigate("/create-business-profile");
        }, 1500);
      } else {
        setMessage("✅ Registration successful! Please check your email to confirm your account.");
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "Something went wrong during registration");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign up
  const handleGoogleRegister = async () => {
    setError(null);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login-redirect?user_type=business`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        console.error('Google OAuth Error:', error);
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Google registration error:', err);
      setError("Failed to register with Google");
    }
  };

  // Handle Magic Link Register
  const handleMagicLinkRegister = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { 
            business_name: businessName,
            user_type: "business"
          },
          emailRedirectTo: `${window.location.origin}/create-business-profile`,
        },
      });

      if (error) {
        console.error('Magic Link Error:', error);
        setError(error.message);
      } else {
        setMessage("📩 Magic Link sent! Check your email.");
      }
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError("Failed to send magic link");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:py-8">
        <div className="container flex flex-col lg:flex-row items-center max-w-6xl gap-8 lg:gap-12">
          {/* Left Illustration - Hidden on Mobile */}
          <div className="hidden lg:flex flex-1 justify-center">
            <img
              src={registerIllustration}
              alt="Business Registration"
              className="w-130 max-w-lg"
            />
          </div>

          {/* Right Form - Full width on mobile */}
          <div className="w-full lg:flex-1 bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md lg:max-w-lg">
            {/* Header with Back Button */}
            <div className="flex items-center gap-2 sm:gap-3 mb-6">
              <button
                onClick={() => navigate("/register")}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-full">
                  <Building2 size={18} className="sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Business Registration</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Create your business profile</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Business Name */}
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Enter Your Business Name"
                className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors touch-manipulation"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              {/* Email */}
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Business Email"
                className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors touch-manipulation"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* ✅ UPDATED: Password with Eye Toggle */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password (min 6 characters)"
                  className="w-full border border-gray-300 rounded-md px-3 py-3 pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors touch-manipulation"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ✅ ADDED: Confirm Password with Eye Toggle */}
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`w-full border rounded-md px-3 py-3 pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors touch-manipulation ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : confirmPassword && password === confirmPassword
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ✅ ADDED: Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center text-xs">
                  {password === confirmPassword ? (
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Passwords match
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}

              {/* Primary Register Button */}
              <button
                type="submit"
                className="w-full py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 active:bg-orange-800 transition-colors duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                disabled={loading || (confirmPassword !== "" && password !== confirmPassword)}
              >
                {loading ? "Creating Account..." : "Create Business Account"}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 transition duration-200 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 text-sm sm:text-base touch-manipulation"
              >
                <img src={googleIcon} alt="Google" className="w-4 sm:w-5" />
                Continue with Google
              </button>

              {/* Magic Link Button */}
              <button
                type="button"
                onClick={handleMagicLinkRegister}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 transition duration-200 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 text-sm sm:text-base touch-manipulation"
              >
                <img src={emailIcon} alt="Email" className="w-4 sm:w-5" />
                Sign in with Magic Link
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center px-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <a href="/login" className="text-orange-500 hover:text-orange-600 hover:underline font-medium transition-colors">
                  Login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

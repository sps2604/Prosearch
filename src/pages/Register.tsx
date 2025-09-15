import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import registerIllustration from "../assets/register-illustration.svg";
import googleIcon from "../assets/google-icon.png";
import emailIcon from "../assets/email-icon.webp";
import Navbar from "../components/BeforeLoginNavbar";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: `${window.location.origin}/create-profile`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user && !data.user.email_confirmed_at) {
        setMessage("📩 Registration successful! Please check your email to confirm your account.");
      } else if (data.user && data.user.email_confirmed_at) {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => navigate("/create-profile"), 1500);
      } else {
        setMessage("✅ Registration successful! Please check your email to confirm your account.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/create-profile`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) setError(error.message);
    } catch {
      setError("Failed to register with Google");
    }
  };

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
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: `${window.location.origin}/create-profile`,
        },
      });
      if (error) setError(error.message);
      else setMessage("📩 Magic Link sent! Check your email.");
    } catch {
      setError("Failed to send magic link");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Illustration */}
          <div className="hidden md:flex justify-center items-center">
            <img
              src={registerIllustration}
              alt="Register Illustration"
              className="w-full max-w-sm h-auto"
            />
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Join Professional Search</h2>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter Your First Name"
                className="w-full border rounded-md px-3 py-3"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter Your Last Name"
                className="w-full border rounded-md px-3 py-3"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email"
                className="w-full border rounded-md px-3 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Password"
                className="w-full border rounded-md px-3 py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="button"
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center gap-2 border rounded-md py-3 hover:bg-gray-100 hover:border-gray-400"
              >
                <img src={googleIcon} alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleMagicLinkRegister}
                className="w-full flex items-center justify-center gap-2 border rounded-md py-3 hover:bg-gray-100 hover:border-gray-400"
              >
                <img src={emailIcon} alt="Email" className="w-5 h-5" />
                Sign in with Magic Link
              </button>

              <button
                type="submit"
                className={`w-full py-3 rounded-md transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
                disabled={loading}
              >
                {loading ? "Registering..." : "Agree & Join"}
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

              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
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

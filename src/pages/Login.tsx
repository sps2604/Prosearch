import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import { supabase } from "../lib/supabaseClient";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import LoginIllustration from "../assets/login-illustration.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data?.user && data?.session) {
      navigate("/home2?justLoggedIn=true");
    } else {
      setError("No active session returned. Check your Supabase settings.");
    }
  };

  const handleMagicLink = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/home2?justLoggedIn=true`,
      },
    });

    setLoading(false);

    if (error) setError(error.message);
    else setMessage("📩 Magic Link sent! Check your email.");
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/home2?justLoggedIn=true` },
      });
      if (error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AuthNavbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Illustration */}
          <div className="hidden md:flex items-center justify-center">
            <img
              src={LoginIllustration}
              alt="Login Illustration"
              className="w-full max-w-sm h-auto"
            />
          </div>

          {/* Form */}
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Login to your Digital CV</h2>
            <p className="text-gray-500 mb-6">Build. Share. Get Hired</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-md px-3 py-3"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-md px-3 py-3"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-600 text-sm">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <button
              onClick={handleMagicLink}
              className="w-full text-right text-sm mt-3 text-blue-600 hover:underline"
            >
              Forgotten password?
            </button>

            <Link
              to="/register"
              className="block text-center w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-md mt-4"
            >
              Create New Account
            </Link>

            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="px-2 text-gray-400 text-sm">Or continue with</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border rounded-md py-3 mb-3 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50"
            >
              <FaEnvelope />
              Login with email
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border rounded-md py-3 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50"
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

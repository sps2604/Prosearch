import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Shield,
  Key
} from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // ✅ NEW: Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    score: 0
  });

  // ✅ Check if user has a valid reset session
  useEffect(() => {
    const checkResetSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setIsValidSession(false);
          setError("Invalid or expired reset session. Please request a new password reset.");
          return;
        }
        setIsValidSession(true);
      } catch (err) {
        setIsValidSession(false);
        setError("Failed to verify reset session");
      }
    };

    checkResetSession();
  }, []);

  // ✅ NEW: Real-time password strength checking
  useEffect(() => {
    const checkPasswordStrength = (password: string) => {
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };

      const score = Object.values(checks).filter(Boolean).length;
      
      setPasswordStrength({
        ...checks,
        score
      });
    };

    checkPasswordStrength(password);
  }, [password]);

  // ✅ NEW: Enhanced form validation
  const validateForm = () => {
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please include uppercase, lowercase, numbers, and special characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // ✅ Enhanced password reset handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get current user
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;

      // Update password
      const { error: authErr } = await supabase.auth.updateUser({ 
        password 
      });

      if (authErr) {
        setError(authErr.message);
        return;
      }

      // ✅ Optional: Update audit timestamp in profiles table
      if (userId) {
        try {
          await supabase
            .from('user_profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } catch (profileError) {
          // Don't fail the password reset if profile update fails
          console.warn("Failed to update profile timestamp:", profileError);
        }
      }

      setMessage("✅ Password updated successfully! Redirecting...");
      
      // ✅ Sign out user to force re-login with new password
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Password updated successfully! Please log in with your new password." }
        });
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get password strength color and text
  const getPasswordStrengthInfo = () => {
    if (passwordStrength.score === 0) return { color: "text-gray-400", text: "Enter password", bgColor: "bg-gray-200" };
    if (passwordStrength.score <= 2) return { color: "text-red-600", text: "Weak", bgColor: "bg-red-200" };
    if (passwordStrength.score <= 3) return { color: "text-yellow-600", text: "Fair", bgColor: "bg-yellow-200" };
    if (passwordStrength.score <= 4) return { color: "text-blue-600", text: "Good", bgColor: "bg-blue-200" };
    return { color: "text-green-600", text: "Strong", bgColor: "bg-green-200" };
  };

  const strengthInfo = getPasswordStrengthInfo();

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset session...</p>
        </div>
      </div>
    );
  }

  // Show error if invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Session</h2>
          <p className="text-gray-600 mb-6">
            Your password reset link has expired or is invalid. Please request a new one.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">Create a new secure password for your account</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Password Strength:</span>
                  <span className={`text-sm font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                
                {/* Strength Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bgColor}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 ${passwordStrength.length ? 'text-green-600' : 'text-gray-300'}`} />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-300'}`} />
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-300'}`} />
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 ${passwordStrength.number ? 'text-green-600' : 'text-gray-300'}`} />
                    Number
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 ${passwordStrength.special ? 'text-green-600' : 'text-gray-300'}`} />
                    Special character
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  confirmPassword && password !== confirmPassword 
                    ? 'border-red-300 bg-red-50' 
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2">
                {password === confirmPassword ? (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordStrength.score < 3 || password !== confirmPassword}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating Password...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>

          {/* Back to Login Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-xs text-center">
            🔒 Your password will be securely encrypted and cannot be recovered. 
            Make sure to remember your new password.
          </p>
        </div>
      </div>
    </div>
  );
}

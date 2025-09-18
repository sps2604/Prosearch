import { useNavigate } from "react-router-dom";
import { Building2, User } from "lucide-react";
import Navbar from "../components/BeforeLoginNavbar";
import registerIllustration from "../assets/register-illustration.svg";

export default function UserTypeSelection() {
  const navigate = useNavigate();

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
              alt="Join Professional Search"
              className="w-130 max-w-lg"
            />
          </div>

          {/* Right Selection - Full width on mobile */}
          <div className="w-full lg:flex-1 bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md lg:max-w-lg">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">
                Join Professional Search
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Choose how you want to get started
              </p>
            </div>

            {/* Selection Options */}
            <div className="space-y-3 sm:space-y-4">
              {/* Professional Option */}
              <button
                onClick={() => navigate("/register/professional")}
                className="w-full p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 group touch-manipulation"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <User size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      I'm a Professional
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Showcase your skills and connect with opportunities
                    </p>
                  </div>
                </div>
              </button>

              {/* Business Option */}
              <button
                onClick={() => navigate("/register/business")}
                className="w-full p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 active:bg-orange-100 transition-all duration-200 group touch-manipulation"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors flex-shrink-0">
                    <Building2 size={20} className="sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      I'm a Business Owner
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Find talent and grow your business network
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs text-gray-500 mb-3 sm:mb-4 px-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
              
              <p className="text-sm">
                Already have an account?{" "}
                <a 
                  href="/login" 
                  className="text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

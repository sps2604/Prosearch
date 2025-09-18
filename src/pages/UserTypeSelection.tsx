import { useNavigate } from "react-router-dom";
import { FaUser, FaBriefcase } from "react-icons/fa";
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
      <div className="flex flex-1 items-center justify-center">
        <div className="container flex flex-col md:flex-row items-center max-w-6xl gap-8 p-8">
          {/* Left Illustration */}
          <div className="flex-1 flex justify-center">
            <img
              src={registerIllustration}
              alt="Join Professional Search"
              className="w-130"
            />
          </div>

          {/* Right Selection */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-8 max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Join Professional Search
              </h2>
              <p className="text-gray-600">Choose how you want to get started</p>
            </div>

            {/* Selection Options */}
            <div className="space-y-4">
              {/* Professional Option */}
              <button
                onClick={() => navigate("/register/professional")}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      I'm a Professional
                    </h3>
                    <p className="text-sm text-gray-600">
                      Showcase your skills and connect with opportunities
                    </p>
                  </div>
                </div>
              </button>

              {/* Business Option */}
              <button
                onClick={() => navigate("/register/business")}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                    <Building2 size={24} className="text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      I'm a Business Owner
                    </h3>
                    <p className="text-sm text-gray-600">
                      Find talent and grow your business network
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 mb-4">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
              
              <p className="text-sm">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
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

import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, CheckCircle } from "lucide-react";
import { useUser } from "../context/UserContext";

// Import all components
import Hero from "../components/hero";
import Stats from "../components/stats";
import PopularSearches from "../components/popular_searches";
import ChoosePath from "../components/choosepath";
import Domains from "../components/domain";
import FeaturedProfiles from "../components/featured_profile";
import Navbar from "../components/BeforeLoginNavbar";
import Footer from "../components/footer";

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const handlePostJob = () => {
    if (!profile) {
      // If not logged in, redirect to register/login
      navigate("/register");
    } else if (profile.user_type === "business") {
      // If business user, go to Post Job page
      navigate("/post-job");
    } else if (profile.user_type === "professional") {
      // If professional, suggest they register as business
      navigate("/register/business"); // ✅ FIXED: Correct route path
    } else {
      // Fallback
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Platform Statistics */}
      <Stats />
      
      {/* Popular Search Terms */}
      <PopularSearches />
      
      {/* Choose Your Path Section */}
      <ChoosePath />
      
      {/* Domain Categories */}
      <Domains />
      
      {/* Featured Professionals */}
      <FeaturedProfiles />
      
      {/* Enhanced Post Job CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Next Team Member?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Post your job and connect with talented professionals
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePostJob}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold shadow-lg"
            >
              <PlusCircle className="w-6 h-6" />
              {profile?.user_type === "business" ? "Post a Job" : "Get Started - Post a Job"}
            </button>
            
            <button
              onClick={() => navigate("/find-job")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold"
            >
              <Search className="w-6 h-6" />
              Browse Talent First
            </button>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to post</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Instant applications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Quality candidates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import Hero from "../components/hero";
import Stats from "../components/stats";
import PopularSearches from "../components/popular_searches";
import ChoosePath from "../components/choosepath";
import Domains from "../components/domain";
import FeaturedProfiles from "../components/featured_profile";
import Navbar from "../components/BeforeLoginNavbar";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const handlePostJob = () => {
    if (!profile) {
      navigate("/login");
    } else {
      navigate("/post-job");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <Hero />
        <Stats />
        <PopularSearches />
        <ChoosePath />
        <Domains />
        <FeaturedProfiles />

        {/* Post Job CTA */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handlePostJob}
            className="w-full max-w-xs sm:max-w-none sm:w-auto px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Post a Job
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

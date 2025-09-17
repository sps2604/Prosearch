import { useEffect, useState } from "react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Hero from "../components/hero";
import Stats from "../components/stats";
import PopularSearches from "../components/popular_searches";
import ChoosePath from "../components/choosepath";
import Domains from "../components/domain";
import FeaturedProfiles from "../components/featured_profile";
import Footer from "../components/footer";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext"; // Import useUser

export default function Home2() {
  const [loading, setLoading] = useState(false);
  const { profile } = useUser(); // Access profile from UserContext

  useEffect(() => {
    // Only show toast if profile is available and it's a fresh login
    const urlParams = new URLSearchParams(window.location.search);
    if (profile && urlParams.get("justLoggedIn") === "true") {
      const userName = profile.user_type === "business" ? profile.business_name : (profile.first_name || profile.email || "user");
      toast.success(`🎉 You logged in successfully, ${userName}!`, {
        duration: 4000,
      });
      window.history.replaceState(null, "", "/home2");
    }

    // After initial load, if profile exists, set loading to false
    if (profile) {
      setLoading(false);
    } else {
      // If no profile and not just logged in, still show loading if needed or redirect
      // For now, assume if profile is null, it's still loading or not logged in.
      // This can be refined later if needed to explicitly redirect to login.
    }

  }, [profile]); // Depend on profile to trigger when user context is updated

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      <AfterLoginNavbar />
      <Hero />
      <Stats />
      <PopularSearches />
      <ChoosePath />
      <Domains />
      <FeaturedProfiles />
      <Footer />
    </div>
  );
}

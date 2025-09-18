import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import {
  FaHome,
  FaBriefcase,
  FaRegQuestionCircle,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

export default function AfterLoginNavbar() {
  const { profile, setProfile } = useUser();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user_type from database tables instead of auth metadata
  useEffect(() => {
    const fetchUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Try to get user_type from user_profiles first
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();
      
      if (profileData?.user_type) {
        setAuthUserType(profileData.user_type);
        return;
      }
      
      // If not found in user_profiles, try businesses table
      const { data: businessData } = await supabase
        .from("businesses")
        .select("user_type")
        .eq("user_id", user.id) // ✅ Use user_id
        .single();
      
      if (businessData?.user_type) {
        setAuthUserType(businessData.user_type);
      }
    };
    
    if (!profile?.user_type) {
      fetchUserType();
    }
  }, [profile?.user_type]);

  const effectiveUserType = profile?.user_type ?? authUserType;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null); // Clear user profile from context
    navigate("/");
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
    setOpen(false);
  };

  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
        <button
          onClick={() => handleNav("/home2")}
          className="font-bold text-lg sm:text-xl hover:text-blue-600 transition-colors duration-200"
        >
          Professional Search
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => handleNav("/home2")}
          className="flex flex-col items-center text-xs hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
        >
          <FaHome className="text-xl mb-1" />
          Home
        </button>
        {effectiveUserType !== "business" && (
          <button
            onClick={() => handleNav("/find-job")}
            className="flex flex-col items-center text-xs hover:text-green-600 p-2 rounded-lg hover:bg-green-50"
          >
            <FaBriefcase className="text-xl mb-1" />
            Jobs
          </button>
        )}
        {effectiveUserType === "business" && (
          <button
            onClick={() => handleNav("/post-job")}
            className="flex flex-col items-center text-xs hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50"
          >
            <MdPostAdd className="text-xl mb-1" />
            Post
          </button>
        )}
        <button
          onClick={() => handleNav("/help")}
          className="flex flex-col items-center text-xs hover:text-orange-600 p-2 rounded-lg hover:bg-orange-50"
        >
          <FaRegQuestionCircle className="text-xl mb-1" />
          Help
        </button>
        <button
          onClick={() => handleNav("/notifications")}
          className="flex flex-col items-center text-xs hover:text-red-600 p-2 rounded-lg hover:bg-red-50 relative"
        >
          <IoMdNotificationsOutline className="text-xl mb-1" />
          Alerts
        </button>

        {/* User Dropdown (desktop) */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col items-center text-xs hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
          >
            <FaUser className="text-xl mb-1" />
            <span>{profile?.first_name || "Me"}</span>
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg border z-50 py-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {profile?.first_name} {profile?.last_name || ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.email || "user@example.com"}
                  </p>
                </div>
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => handleNav(profile?.user_type === "business" ? "/business-profile" : "/profile")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNav("/settings")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Settings
                    </button>
                  </li>
                  <li className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-2xl text-gray-700"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start p-4 md:hidden">
          <button
            onClick={() => handleNav("/home2")}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-blue-50 rounded-md"
          >
            <FaHome /> Home
          </button>
          {effectiveUserType !== "business" && (
            <button
              onClick={() => handleNav("/find-job")}
              className="w-full flex items-center gap-2 py-2 px-3 hover:bg-green-50 rounded-md"
            >
              <FaBriefcase /> Jobs
            </button>
          )}
          {effectiveUserType === "business" && (
            <button
              onClick={() => handleNav("/post-job")}
              className="w-full flex items-center gap-2 py-2 px-3 hover:bg-purple-50 rounded-md"
            >
              <MdPostAdd /> Post
            </button>
          )}
          <button
            onClick={() => handleNav("/help")}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-orange-50 rounded-md"
          >
            <FaRegQuestionCircle /> Help
          </button>
          <button
            onClick={() => handleNav("/notifications")}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-red-50 rounded-md"
          >
            <IoMdNotificationsOutline /> Alerts
          </button>

          {/* User Section (mobile) */}
          <div className="w-full mt-3 border-t pt-3">
            <p className="text-sm font-medium text-gray-800">
              {profile?.first_name} {profile?.last_name || ""}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              {profile?.email || "user@example.com"}
            </p>
            <button
              onClick={() => handleNav(profile?.user_type === "business" ? "/business-profile" : "/profile")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              Profile
            </button>
            <button
              onClick={() => handleNav("/settings")}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

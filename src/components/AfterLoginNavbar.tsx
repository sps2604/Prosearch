import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png"; 
import {
  FaHome,
  FaBriefcase,
  FaRegQuestionCircle,
  FaUser,
} from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useState } from "react";

// ✅ Correct relative imports based on your structure
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

export default function AfterLoginNavbar() {
  const { profile } = useUser();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // redirect to login/home
  };

  const handleUserDropdownToggle = () => setUserDropdownOpen(!userDropdownOpen);

  // Navigation handlers
  const handleNav = (path: string) => {
    navigate(path);
    setUserDropdownOpen(false); // close dropdown if open
    setMobileMenuOpen(false); // close mobile menu if open
  };

  // Mobile navigation button component
  const MobileNavButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full text-left"
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Desktop Navigation - Exact original styling */}
      <div className="hidden lg:flex justify-between items-center px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Logo"
            className="h-12 w-auto object-contain"
          />
          <button
            onClick={() => handleNav("/home2")}
            className="font-bold text-xl hover:text-blue-600 transition-colors duration-200"
          >
            Professional Search
          </button>
        </div>

        {/* Navigation Buttons - Original styling */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => handleNav("/home2")}
            className="flex flex-col items-center text-xs hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
          >
            <FaHome className="text-xl mb-1" />
            Home
          </button>
          <button
            onClick={() => handleNav("/find-job")}
            className="flex flex-col items-center text-xs hover:text-green-600 p-2 rounded-lg hover:bg-green-50"
          >
            <FaBriefcase className="text-2xl mb-1" />
            Jobs
          </button>
          <button
            onClick={() => handleNav("/post-job")}
            className="flex flex-col items-center text-xs hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50"
          >
            <MdPostAdd className="text-xl mb-1" />
            Post
          </button>
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

          {/* User Dropdown - Original styling */}
          <div className="relative">
            <button
              onClick={handleUserDropdownToggle}
              className="flex flex-col items-center text-xs hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
            >
              <FaUser className="text-xl mb-1" />
              <span>{profile?.first_name || "Me"}</span>
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                ></div>
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
                        onClick={() => handleNav("/profile")}
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
      </div>

      {/* Mobile/Tablet Navigation - New responsive design */}
      <div className="lg:hidden">
        <div className="px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Professional Search logo" className="h-10 w-auto object-contain" />
              <button onClick={() => handleNav("/home2")} className="font-bold text-base sm:text-lg hover:text-blue-600">
                Professional Search
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-auth"
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileMenuOpen && (
          <div id="mobile-menu-auth" className="border-t border-gray-200">
            <div className="px-4 py-3 flex flex-col">
              <MobileNavButton onClick={() => handleNav("/home2")}>
                <FaHome className="text-base" />
                <span>Home</span>
              </MobileNavButton>
              <MobileNavButton onClick={() => handleNav("/find-job")}>
                <FaBriefcase className="text-base" />
                <span>Jobs</span>
              </MobileNavButton>
              <MobileNavButton onClick={() => handleNav("/post-job")}>
                <MdPostAdd className="text-base" />
                <span>Post</span>
              </MobileNavButton>
              <MobileNavButton onClick={() => handleNav("/help")}>
                <FaRegQuestionCircle className="text-base" />
                <span>Help</span>
              </MobileNavButton>
              <MobileNavButton onClick={() => handleNav("/notifications")}>
                <IoMdNotificationsOutline className="text-base" />
                <span>Alerts</span>
              </MobileNavButton>

              <div className="mt-3 pt-3 border-t border-gray-200 rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {profile?.first_name} {profile?.last_name || ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{profile?.email || "user@example.com"}</p>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={() => handleNav("/profile")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                    Profile
                  </button>
                  <button onClick={() => handleNav("/settings")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
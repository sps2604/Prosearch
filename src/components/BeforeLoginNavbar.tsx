import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaRegQuestionCircle, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import Logo from "../assets/logo.png";

export default function BeforeLoginNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const MobileLinkBtn = ({
    onClick,
    children,
    className = ""
  }: {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full text-left ${className}`}
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo - Same for both desktop and mobile */}
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-12 w-auto object-contain"/>
          <button 
            onClick={() => navigate("/")}
            className="font-semibold text-lg hover:text-blue-600 transition-colors"
          >
            Professional Search
          </button>
        </div>

        {/* Desktop Navigation Links - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center text-sm hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
          >
            <FaHome className="text-xl mb-1" />
            Home
          </button>

          {/* Browse Jobs Button */}
          <button
            onClick={() => navigate("/browse-jobs")}
            className="flex flex-col items-center text-sm hover:text-green-600 transition-colors duration-200 p-2 rounded-lg hover:bg-green-50"
          >
            <FaBriefcase className="text-xl mb-1" />
            Browse Jobs
          </button>

          {/* Post Job Button */}
          <button
            onClick={() => navigate("/login")}
            className="flex flex-col items-center text-sm hover:text-purple-600 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-50"
          >
            <MdPostAdd className="text-xl mb-1" />
            Post Job
          </button>

          {/* Help Button */}
          <button
            onClick={() => navigate("/help")}
            className="flex flex-col items-center text-sm hover:text-orange-600 transition-colors duration-200 p-2 rounded-lg hover:bg-orange-50"
          >
            <FaRegQuestionCircle className="text-xl mb-1" />
            Help
          </button>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4 ml-4 border-l border-gray-300 pl-4">
            {/* Login Button */}
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              <FaSignInAlt className="text-sm" />
              <span className="text-sm font-medium">Login</span>
            </button>

            {/* Register Button */}
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <FaUserPlus className="text-sm" />
              <span className="text-sm font-medium">Sign Up</span>
            </button>
          </div>
        </div>

        {/* Mobile hamburger menu button */}
        <button
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div id="mobile-menu" className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 flex flex-col">
            <MobileLinkBtn onClick={() => navigate("/")} className="hover:text-blue-600">
              <FaHome className="text-base" />
              <span>Home</span>
            </MobileLinkBtn>
            
            <MobileLinkBtn onClick={() => navigate("/browse-jobs")} className="hover:text-green-600">
              <FaBriefcase className="text-base" />
              <span>Browse Jobs</span>
            </MobileLinkBtn>
            
            <MobileLinkBtn onClick={() => navigate("/login")} className="hover:text-purple-600">
              <MdPostAdd className="text-base" />
              <span>Post Job</span>
            </MobileLinkBtn>
            
            <MobileLinkBtn onClick={() => navigate("/help")} className="hover:text-orange-600">
              <FaRegQuestionCircle className="text-base" />
              <span>Help</span>
            </MobileLinkBtn>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-3 pt-4 mt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate("/login");
                  setOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                <FaSignInAlt className="text-sm" />
                <span className="text-sm font-medium">Login</span>
              </button>
              
              <button
                onClick={() => {
                  navigate("/register");
                  setOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaUserPlus className="text-sm" />
                <span className="text-sm font-medium">Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
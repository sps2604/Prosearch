import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBriefcase,
  FaRegQuestionCircle,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import Logo from "../assets/logo.png";

export default function BeforeLoginNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
        <button
          onClick={() => navigate("/")}
          className="font-bold text-lg sm:text-xl hover:text-blue-600 transition-colors duration-200"
        >
          Professional Search
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        {/* Navigation Links */}
        <button
          onClick={() => handleNav("/")}
          className="flex flex-col items-center text-xs hover:text-blue-600 transition-colors duration-200 p-3 rounded-lg hover:bg-blue-50"
        >
          <FaHome className="text-lg mb-1" />
          Home
        </button>
        
        {/* ✅ Browse Jobs - Redirects to login */}
        <button
          onClick={() => handleNav("/login")}
          className="flex flex-col items-center text-xs hover:text-green-600 transition-colors duration-200 p-3 rounded-lg hover:bg-green-50"
        >
          <FaBriefcase className="text-lg mb-1" />
          Jobs
        </button>
        
        {/* ✅ Post Job - Redirects to login */}
        <button
          onClick={() => handleNav("/login")}
          className="flex flex-col items-center text-xs hover:text-purple-600 transition-colors duration-200 p-3 rounded-lg hover:bg-purple-50"
        >
          <MdPostAdd className="text-lg mb-1" />
          Post
        </button>
        
        <button
          onClick={() => handleNav("/help")}
          className="flex flex-col items-center text-xs hover:text-orange-600 transition-colors duration-200 p-3 rounded-lg hover:bg-orange-50"
        >
          <FaRegQuestionCircle className="text-lg mb-1" />
          Help
        </button>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
          <button
            onClick={() => handleNav("/login")}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
          >
            <FaSignInAlt className="text-sm" />
            <span className="text-sm font-medium">Login</span>
          </button>
          <button
            onClick={() => handleNav("/register")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            <FaUserPlus className="text-sm" />
            <span className="text-sm font-medium">Sign Up</span>
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-2xl text-gray-700"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start p-4 md:hidden border-t border-gray-100">
          {/* Navigation Links */}
          <button
            onClick={() => handleNav("/")}
            className="w-full flex items-center gap-3 py-3 px-3 hover:bg-blue-50 rounded-md transition-colors"
          >
            <FaHome className="text-lg" /> 
            <span>Home</span>
          </button>
          
          {/* ✅ Browse Jobs - Redirects to login */}
          <button
            onClick={() => handleNav("/login")}
            className="w-full flex items-center gap-3 py-3 px-3 hover:bg-green-50 rounded-md transition-colors"
          >
            <FaBriefcase className="text-lg" /> 
            <span>Jobs</span>
          </button>
          
          {/* ✅ Post Job - Redirects to login */}
          <button
            onClick={() => handleNav("/login")}
            className="w-full flex items-center gap-3 py-3 px-3 hover:bg-purple-50 rounded-md transition-colors"
          >
            <MdPostAdd className="text-lg" /> 
            <span>Post</span>
          </button>
          
          <button
            onClick={() => handleNav("/help")}
            className="w-full flex items-center gap-3 py-3 px-3 hover:bg-orange-50 rounded-md transition-colors"
          >
            <FaRegQuestionCircle className="text-lg" /> 
            <span>Help</span>
          </button>

          {/* Auth buttons on mobile */}
          <div className="w-full flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleNav("/login")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              <FaSignInAlt className="text-sm" />
              <span className="text-sm font-medium">Login</span>
            </button>
            <button
              onClick={() => handleNav("/register")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <FaUserPlus className="text-sm" />
              <span className="text-sm font-medium">Sign Up</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

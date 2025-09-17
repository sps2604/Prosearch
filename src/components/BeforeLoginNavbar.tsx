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

  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
        <button
          onClick={() => navigate("/")}
          className="font-semibold text-base sm:text-lg hover:text-blue-600 transition-colors"
        >
          Professional Search
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        {/* Links */}
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-sm hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
        >
          <FaHome className="text-lg mb-1" />
          Home
        </button>
        <button
          onClick={() => navigate("/browse-jobs")}
          className="flex flex-col items-center text-sm hover:text-green-600 transition-colors duration-200 p-2 rounded-lg hover:bg-green-50"
        >
          <FaBriefcase className="text-lg mb-1" />
          Browse Jobs
        </button>
        <button
          onClick={() => navigate("/login")}
          className="flex flex-col items-center text-sm hover:text-purple-600 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-50"
        >
          <MdPostAdd className="text-lg mb-1" />
          Post Job
        </button>
        <button
          onClick={() => navigate("/help")}
          className="flex flex-col items-center text-sm hover:text-orange-600 transition-colors duration-200 p-2 rounded-lg hover:bg-orange-50"
        >
          <FaRegQuestionCircle className="text-lg mb-1" />
          Help
        </button>

        {/* Auth */}
        <div className="flex items-center gap-3 ml-3 border-l border-gray-300 pl-3">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
          >
            <FaSignInAlt className="text-sm" />
            <span className="text-sm font-medium">Login</span>
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
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
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start p-4 md:hidden">
          <button
            onClick={() => {
              navigate("/");
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-blue-50 rounded-md"
          >
            <FaHome /> Home
          </button>
          <button
            onClick={() => {
              navigate("/browse-jobs");
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-green-50 rounded-md"
          >
            <FaBriefcase /> Browse Jobs
          </button>
          <button
            onClick={() => {
              navigate("/login");
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-purple-50 rounded-md"
          >
            <MdPostAdd /> Post Job
          </button>
          <button
            onClick={() => {
              navigate("/help");
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-orange-50 rounded-md"
          >
            <FaRegQuestionCircle /> Help
          </button>

          {/* Auth buttons on mobile */}
          <div className="w-full flex flex-col gap-2 mt-3">
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              <FaSignInAlt className="text-sm" />
              <span className="text-sm font-medium">Login</span>
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
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

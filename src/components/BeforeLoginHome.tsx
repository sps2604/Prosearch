import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBriefcase,
  FaRegQuestionCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import Logo from "../assets/logo.png";

export default function BeforeLoginHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
        <span className="font-semibold text-base sm:text-lg">
          Professional Search
        </span>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          to="/"
          className="flex flex-col items-center text-sm hover:text-gray-600"
        >
          <FaHome className="text-xl" />
          Home
        </Link>
        <Link
          to="/find-job"
          className="flex flex-col items-center text-sm hover:text-gray-600"
        >
          <FaBriefcase className="text-xl" />
          Find Job
        </Link>
        <Link
          to="/post-job"
          className="flex flex-col items-center text-sm hover:text-gray-600"
        >
          <MdPostAdd className="text-xl" />
          Post Job
        </Link>
        <Link
          to="/help"
          className="flex flex-col items-center text-sm hover:text-gray-600"
        >
          <FaRegQuestionCircle className="text-xl" />
          Help
        </Link>
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          to="/login"
          className="px-4 py-1 border rounded-md hover:bg-gray-100"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-4 py-1 rounded-md bg-black text-white hover:bg-gray-800"
        >
          Register
        </Link>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-2xl text-gray-700"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start p-4 md:hidden">
          {/* Nav Links */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
          >
            <FaHome /> Home
          </Link>
          <Link
            to="/find-job"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
          >
            <FaBriefcase /> Find Job
          </Link>
          <Link
            to="/post-job"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
          >
            <MdPostAdd /> Post Job
          </Link>
          <Link
            to="/help"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
          >
            <FaRegQuestionCircle /> Help
          </Link>

          {/* Auth Buttons */}
          <div className="w-full flex flex-col gap-2 mt-3">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center px-3 py-2 border rounded-md hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

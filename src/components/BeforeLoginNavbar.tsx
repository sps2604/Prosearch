import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBriefcase, FaRegQuestionCircle, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import Logo from "../assets/logo.png";

export default function BeforeLoginNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const LinkBtn = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors text-sm"
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Professional Search logo" className="h-10 w-auto object-contain" />
            <button
              onClick={() => navigate("/")}
              className="font-semibold text-base sm:text-lg hover:text-blue-600 transition-colors"
            >
              Professional Search
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <LinkBtn onClick={() => navigate("/")}>
              <FaHome className="text-base" />
              <span>Home</span>
            </LinkBtn>

            <LinkBtn onClick={() => navigate("/browse-job")}>
              <FaBriefcase className="text-base" />
              <span>Browse Jobs</span>
            </LinkBtn>

            <LinkBtn onClick={() => navigate("/login")}>
              <MdPostAdd className="text-base" />
              <span>Post Job</span>
            </LinkBtn>

            <LinkBtn onClick={() => navigate("/help")}>
              <FaRegQuestionCircle className="text-base" />
              <span>Help</span>
            </LinkBtn>

            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                <FaSignInAlt className="text-sm" />
                <span className="text-sm font-medium">Login</span>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaUserPlus className="text-sm" />
                <span className="text-sm font-medium">Sign Up</span>
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
            onClick={() => setOpen((v) => !v)}
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
      </div>

      {/* Mobile panel */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 flex flex-col gap-1">
            <LinkBtn onClick={() => navigate("/")}>
              <FaHome className="text-base" />
              <span>Home</span>
            </LinkBtn>
            <LinkBtn onClick={() => navigate("/browse-job")}>
              <FaBriefcase className="text-base" />
              <span>Browse Jobs</span>
            </LinkBtn>
            <LinkBtn onClick={() => navigate("/login")}>
              <MdPostAdd className="text-base" />
              <span>Post Job</span>
            </LinkBtn>
            <LinkBtn onClick={() => navigate("/help")}>
              <FaRegQuestionCircle className="text-base" />
              <span>Help</span>
            </LinkBtn>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
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

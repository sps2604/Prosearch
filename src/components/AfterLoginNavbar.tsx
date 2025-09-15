import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { FaHome, FaBriefcase, FaRegQuestionCircle, FaUser } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

export default function AfterLoginNavbar() {
  const { profile } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
    setUserOpen(false);
  };

  const NavButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
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
            <button onClick={() => go("/home2")} className="font-bold text-base sm:text-lg hover:text-blue-600">
              Professional Search
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavButton onClick={() => go("/home2")}>
              <FaHome className="text-base" />
              <span>Home</span>
            </NavButton>
            <NavButton onClick={() => go("/find-job")}>
              <FaBriefcase className="text-base" />
              <span>Jobs</span>
            </NavButton>
            <NavButton onClick={() => go("/post-job")}>
              <MdPostAdd className="text-base" />
              <span>Post</span>
            </NavButton>
            <NavButton onClick={() => go("/help")}>
              <FaRegQuestionCircle className="text-base" />
              <span>Help</span>
            </NavButton>
            <NavButton onClick={() => go("/notifications")}>
              <IoMdNotificationsOutline className="text-base" />
              <span>Alerts</span>
            </NavButton>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <FaUser className="text-base" />
                <span className="text-sm">{profile?.first_name || "Me"}</span>
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border z-50 py-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        {profile?.first_name} {profile?.last_name || ""}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{profile?.email || "user@example.com"}</p>
                    </div>
                    <ul className="py-1">
                      <li>
                        <button onClick={() => go("/profile")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                          Profile
                        </button>
                      </li>
                      <li>
                        <button onClick={() => go("/settings")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
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

          {/* Mobile hamburger */}
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu-auth"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div id="mobile-menu-auth" className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 flex flex-col gap-1">
            <NavButton onClick={() => go("/home2")}>
              <FaHome className="text-base" />
              <span>Home</span>
            </NavButton>
            <NavButton onClick={() => go("/find-job")}>
              <FaBriefcase className="text-base" />
              <span>Jobs</span>
            </NavButton>
            <NavButton onClick={() => go("/post-job")}>
              <MdPostAdd className="text-base" />
              <span>Post</span>
            </NavButton>
            <NavButton onClick={() => go("/help")}>
              <FaRegQuestionCircle className="text-base" />
              <span>Help</span>
            </NavButton>
            <NavButton onClick={() => go("/notifications")}>
              <IoMdNotificationsOutline className="text-base" />
              <span>Alerts</span>
            </NavButton>

            <div className="mt-2 rounded-lg border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">
                  {profile?.first_name} {profile?.last_name || ""}
                </p>
                <p className="text-xs text-gray-500 truncate">{profile?.email || "user@example.com"}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <button onClick={() => go("/profile")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                  Profile
                </button>
                <button onClick={() => go("/settings")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
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
    </nav>
  );
}

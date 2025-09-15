import { Link } from "react-router-dom";
import Logo from "../assets/logo.png"; 
export default function AuthNavbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <div className="flex items-center gap-2">
        <img src={Logo} alt="Logo"className="h-12 w-auto object-contain"/>
        <span className="font-semibold text-lg">Professional Search</span>
      </div>
      <div>
        {/* 👇 On login page this will show Register */}
        <Link
          to="/register"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";

const JobPosted: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#e6f3f3]">
      {/* Navbar */}
      <AfterLoginNavbar />

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full">
          {/* Success Icon */}
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Job Posted Successfully!
          </h2>
          <p className="text-gray-600 mb-8">
            Your job listing has been published and is now visible to potential candidates.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/home2")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Go to Home Page
            </button>
            <button
              onClick={() => navigate("/post-job")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Post Another Job
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Professional Search
            </h3>
            <p className="mb-4">
              Your one-stop platform for freelancers, full-time jobs, and
              internships. Connect talent with opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline transition-colors">
                  Post Job
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline transition-colors">
                  Find Job
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Contact Us
            </h3>
            <p className="mb-2">Kharadi, Pune, India</p>
            <p className="mb-2">+91 989898 66172</p>
            <p>hr@professionalsearch.in</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Professional Search. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobPosted;

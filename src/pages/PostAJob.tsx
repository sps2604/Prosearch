"use client";
import React from "react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import JobPostForm from "../components/JobPostForm";
import Footer from "../components/footer";

const PostJobPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AfterLoginNavbar />

      {/* Main Section */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Let's Post Your Job
            </h1>
            <p className="text-lg text-gray-600">
              Connect with talented professionals and find the perfect candidate for your role
            </p>
          </div>

          {/* Using Reusable Form Component */}
          <JobPostForm />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PostJobPage;

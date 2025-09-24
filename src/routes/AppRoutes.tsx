import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Home2 from "../pages/Home2";
import Login from "../pages/Login";
// ✅ UPDATED: Import new registration components
import UserTypeSelection from "../pages/UserTypeSelection";
import RegisterProfessional from "../pages/RegisterProfessional";
import RegisterBusiness from "../pages/RegisterBusiness";
import ResetPassword from "../pages/ResetPassword";
import CreateProfile from "../pages/create-profile";
// Extra pages
import PostJobPage from "../pages/PostAJob";
import FindJobPage from "../pages/FindAJob";
import BrowseJob from "../pages/BrowseAJob";   
import Help from "../pages/Help";
import HowTo from "../pages/HowTo";
import Notifications from "../pages/NotificationPage";   
import BusinessmanNotificationsPage from "../pages/BusinessNotification"; // ✅ PRESERVED: Business notifications
import JobPosted from "../pages/JobPosted";              
import Profile from "../pages/Profile";
// New Profile Pages
import ProfileCard from "../pages/ProfileCard";
import PublicProfile from "../pages/PublicProfile";
import CreateBusinessProfile from "../pages/CreateBusinessProfile";
import BusinessProfilePage from "../pages/BusinessProfile";
import LoginRedirect from "../pages/LoginRedirect";
import BusinessProfileCard from "../pages/BusinessProfileCard";
import PublicProfileCard from "../pages/PublicProfileCard"; // ✅ MERGED: Import PublicProfileCard from first version
// ✅ NEW: Additional public profile pages
import PublicBusinessProfile from "../pages/PublicBusinessProfile";
import PublicCompanyProfile from "../pages/PublicCompanyProfile";
import PublicCompanyCard from "../pages/PublicCompanyCard";
import PublicBusinessCard from "../pages/PublicBusinessCard";
// Edit Profile Pages
import EditProfile from "../pages/EditProfile";
import EditBusinessProfile from "../pages/EditBusinessProfile";
// ✅ NEW: Settings page
import SettingsPage from "../pages/Settings";

import JobDetails from "../pages/JobDetails";
import ApplyNow from "../pages/ApplyNow";
import MyAppliedJobs from "../pages/MyAppliedJobs";
import MyJobPosts from "../pages/MyJobPosts";
import JobApplicants from "../pages/JobApplicants";
import EditJobPost from "../pages/EditJobPost"; // ✅ MERGED: Import EditJobPost from first version

export default function AppRoutes() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Authentication & Base Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* ✅ NEW: Updated Registration Routes */}
          <Route path="/register" element={<UserTypeSelection />} />
          <Route path="/register/professional" element={<RegisterProfessional />} />
          <Route path="/register/business" element={<RegisterBusiness />} />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/login-redirect" element={<LoginRedirect />} />

          {/* Core Job Pages */}
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/find-job" element={<FindJobPage />} />
          <Route path="/browse-job" element={<BrowseJob />} /> 
          <Route path="/my-applied-jobs" element={<MyAppliedJobs />} />
          <Route path="/my-job-posts" element={<MyJobPosts />} />
          <Route path="/my-job-posts/:jobId/applicants" element={<JobApplicants />} />
          <Route path="/edit-job/:id" element={<EditJobPost />} /> {/* ✅ MERGED: Edit job route from first version */}
          <Route path="/help" element={<Help />} />
          <Route path="/how-to/:topic" element={<HowTo />} />

          {/* ✅ ADDED: New Job Routes */}
          <Route path="/job-details/:id" element={<JobDetails />} />
          <Route path="/apply-now" element={<ApplyNow />} />

          {/* ✅ ENHANCED: Notification Routes - Both Types */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/business-notifications" element={<BusinessmanNotificationsPage />} />
          
          <Route path="/job-posted" element={<JobPosted />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-business-profile" element={<CreateBusinessProfile />} />

          {/* ✅ COMPREHENSIVE: Profile Pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/business-profile" element={<BusinessProfilePage />} />
          
          {/* Profile Cards */}
          <Route path="/profile-card" element={<ProfileCard />} />
          <Route path="/profile-card/user/:userId" element={<ProfileCard />} /> {/* ✅ PRESERVED: Dynamic profile card route */}
          <Route path="/business-profile-card" element={<BusinessProfileCard />} />
          
          {/* Public Profiles - All Types */}
          <Route path="/public-profile/:name" element={<PublicProfile />} />
          <Route path="/public-business-profile/:name" element={<PublicBusinessProfile />} /> {/* ✅ NEW */}
          <Route path="/public-company/:name" element={<PublicCompanyProfile />} /> {/* ✅ NEW */}
          
          {/* ✅ MERGED: Applicant Profile Routes from both versions */}
          <Route path="/applicant-profile/:userId" element={<PublicProfileCard />} /> {/* From first version */}
          
          {/* Public Cards - All Types */}
          <Route path="/public-business-card/:name" element={<PublicBusinessCard />} /> {/* ✅ NEW */}
          <Route path="/public-company-card/:name" element={<PublicCompanyCard />} /> {/* ✅ NEW */}
          
          {/* Edit Profile Routes */}
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/edit-business-profile" element={<EditBusinessProfile />} />
          
          {/* ✅ NEW: Settings Route */}
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

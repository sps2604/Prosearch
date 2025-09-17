import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Home2 from "../pages/Home2";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import CreateProfile from "../pages/create-profile";
// Extra pages
import PostJobPage from "../pages/PostAJob";
import FindJobPage from "../pages/FindAJob";
import BrowseJob from "../pages/BrowseAJob";   
import Help from "../pages/Help";
import HowTo from "../pages/HowTo";
import Notifications from "../pages/NotificationPage";   
import JobPosted from "../pages/JobPosted";              
import Profile from "../pages/Profile";
// New Profile Pages
import ProfileCard from "../pages/ProfileCard";
import PublicProfile from "../pages/PublicProfile";
import CreateBusinessProfile from "../pages/CreateBusinessProfile";
import BusinessProfilePage from "../pages/BusinessProfile";
import LoginRedirect from "../pages/LoginRedirect";
import BusinessProfileCard from "../pages/BusinessProfileCard";

export default function AppRoutes() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Authentication & Base Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/login-redirect" element={<LoginRedirect />} />

          {/* Core Job Pages */}
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/find-job" element={<FindJobPage />} />
          <Route path="/browse-job" element={<BrowseJob />} /> 
          <Route path="/help" element={<Help />} />
          <Route path="/how-to/:topic" element={<HowTo />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/job-posted" element={<JobPosted />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-business-profile" element={<CreateBusinessProfile />} />

          {/* Profile Pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/business-profile" element={<BusinessProfilePage />} />
          <Route path="/profile-card" element={<ProfileCard />} />
          <Route path="/business-profile-card" element={<BusinessProfileCard />} />
          <Route path="/public-profile/:name" element={<PublicProfile />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
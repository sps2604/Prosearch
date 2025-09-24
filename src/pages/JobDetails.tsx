import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Mail,
  Phone,
  Globe,
  IndianRupee,
  Users,
  Briefcase,
  Share2,
  Bookmark,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import { type JobPost } from "../components/JobCard";
import { useUser } from "../context/UserContext";
import toast, { Toaster } from "react-hot-toast";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();
  const [job, setJob] = useState<JobPost | null>(location.state?.job || null);
  const [loading, setLoading] = useState(!job);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicantCount, setApplicantCount] = useState(0);

  useEffect(() => {
    if (!job && id) {
      fetchJobDetails();
    }
    if (job?.company_id) {
      fetchCompanyInfo();
    }
    if (job && profile) {
      checkApplicationStatus();
      fetchApplicantCount();
      checkBookmarkStatus();
    }
  }, [id, job, profile]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("Job_Posts")
        .select("*, deadline")
        .eq("id", id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    if (!job?.company_id) return;

    try {
      let data, error;
      
      // First try businesses table
      const businessResponse = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", job.company_id)
        .single();

      if (businessResponse.data) {
        data = businessResponse.data;
      } else {
        // Fallback to Companies table
        const companyResponse = await supabase
          .from("Companies")
          .select("*")
          .eq("id", job.company_id)
          .single();
        
        data = companyResponse.data;
        error = companyResponse.error;
      }

      if (error) throw error;
      setCompanyInfo(data);
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  // Check if user has already applied
  const checkApplicationStatus = async () => {
    if (!profile?.id || !job?.id) return;

    try {
      const { data} = await supabase
        .from("Applications")
        .select("id")
        .eq("job_id", job.id)
        .eq("applicant_id", profile.id)
        .single();

      setHasApplied(!!data);
    } catch (error) {
      // No application found - this is fine
    }
  };

  // Get applicant count
  const fetchApplicantCount = async () => {
    if (!job?.id) return;

    try {
      const { count, error } = await supabase
        .from("Applications")
        .select("*", { count: "exact", head: true })
        .eq("job_id", job.id);

      if (error) throw error;
      setApplicantCount(count || 0);
    } catch (error) {
      console.error("Error fetching applicant count:", error);
    }
  };

  // Check bookmark status
  const checkBookmarkStatus = async () => {
    if (!profile?.id || !job?.id) return;

    try {
      const { data } = await supabase
        .from("Bookmarks")
        .select("id")
        .eq("job_id", job.id)
        .eq("user_id", profile.id)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // Not bookmarked - this is fine
    }
  };

  // Toggle bookmark
  const handleBookmark = async () => {
    if (!profile?.id || !job?.id) return;

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("Bookmarks")
          .delete()
          .eq("job_id", job.id)
          .eq("user_id", profile.id);

        if (error) throw error;
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        const { error } = await supabase
          .from("Bookmarks")
          .insert([{
            job_id: job.id,
            user_id: profile.id,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        setIsBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  // Share job
  const handleShare = async () => {
    const jobUrl = `${window.location.origin}/job-details/${job?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.profession} - Job Opportunity`,
          text: `Check out this job: ${job?.profession} at ${companyInfo?.business_name || companyInfo?.name || 'Company'}`,
          url: jobUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(jobUrl);
        toast.success("Job link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(jobUrl);
      toast.success("Job link copied to clipboard!");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if deadline has passed
  const isDeadlinePassed = () => {
    if (!job?.deadline) return false;
    return new Date(job.deadline) < new Date();
  };

  // Check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = () => {
    if (!job?.deadline) return false;
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffInDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3 && diffInDays > 0;
  };

  const handleApplyNow = () => {
    if (hasApplied) {
      // ✅ FIXED: Use toast.success instead of toast.info
      toast.success("You have already applied to this job", {
        icon: "ℹ️",
        duration: 3000,
      });
      return;
    }
    
    if (isDeadlinePassed()) {
      toast.error("Application deadline has passed");
      return;
    }
    
    navigate("/apply-now", { state: { job } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">
              The job you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => navigate("/find-job")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      <AfterLoginNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {job.profession}
                  </h1>
                  
                  {/* Company Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={18} className="text-gray-400" />
                    <span className="text-lg text-gray-700 font-medium">
                      {companyInfo?.business_name || companyInfo?.name || job.company_name || `Company ID: ${job.company_id}`}
                    </span>
                  </div>
                  
                  {/* Date Information */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Posted: {formatDate(job.created_at)}</span>
                    </div>
                    {job.deadline && (
                      <div className={`flex items-center gap-1 ${
                        isDeadlinePassed() ? 'text-red-600' : 
                        isDeadlineApproaching() ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        <Calendar size={16} />
                        <span>Deadline: {formatDate(job.deadline)}</span>
                        {isDeadlinePassed() && (
                          <AlertTriangle size={14} className="ml-1" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Applicant Count */}
                  {applicantCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users size={16} />
                      <span>{applicantCount} {applicantCount === 1 ? 'person has' : 'people have'} applied</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={handleApplyNow}
                    disabled={hasApplied || isDeadlinePassed()}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      hasApplied 
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : isDeadlinePassed()
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasApplied ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        Applied
                      </div>
                    ) : isDeadlinePassed() ? (
                      'Deadline Passed'
                    ) : (
                      'Apply Now'
                    )}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleBookmark}
                      className={`flex-1 p-2 rounded-lg border transition-colors ${
                        isBookmarked 
                          ? 'border-yellow-300 bg-yellow-50 text-yellow-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      title="Share job"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    {job.salary}
                  </span>
                </div>
                {job.experience && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{job.experience}</span>
                  </div>
                )}
              </div>

              {/* Job Types */}
              {job.job_type && job.job_type.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {job.job_type.map((type, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-lg border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Company Info */}
            {companyInfo && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About Company
                </h3>
                <div className="space-y-4">
                  {/* Company Logo/Avatar */}
                  <div className="flex items-center gap-3">
                    {companyInfo.logo_url ? (
                      <img
                        src={companyInfo.logo_url}
                        alt="Company Logo"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Building2 size={20} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {companyInfo.business_name || companyInfo.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {companyInfo.industry || "Company"}
                      </p>
                    </div>
                  </div>

                  {/* Company Summary */}
                  {companyInfo.summary && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {companyInfo.summary}
                    </p>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-2">
                    {companyInfo.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        <a
                          href={`mailto:${companyInfo.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {companyInfo.email}
                        </a>
                      </div>
                    )}

                    {companyInfo.contact && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{companyInfo.contact}</span>
                      </div>
                    )}

                    {companyInfo.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe size={16} className="text-gray-400" />
                        <a
                          href={companyInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Job Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Contact Information
              </h3>
              <div className="space-y-3">
                {job.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <a
                      href={`mailto:${job.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {job.email}
                    </a>
                  </div>
                )}

                {job.contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-700">{job.contact}</span>
                  </div>
                )}

                {job.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={16} className="text-gray-400" />
                    <a
                      href={job.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button (Sticky) */}
            <div className="sticky top-8">
              <button
                onClick={handleApplyNow}
                disabled={hasApplied || isDeadlinePassed()}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  hasApplied 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                    : isDeadlinePassed()
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                    : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {hasApplied ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Already Applied
                  </div>
                ) : isDeadlinePassed() ? (
                  'Application Deadline Passed'
                ) : (
                  'Apply for this Job'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

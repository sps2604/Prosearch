import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import { ArrowLeft, User, Mail, Phone, FileText, Eye, X, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface JobApplication {
  id: number; // This is the application ID from the Applications table
  applicant_id: string; // This is the UUID of the applicant
  full_name: string;
  email: string;
  phone?: string | null;
  resume_url?: string | null;
  cover_letter_url?: string | null;
  status: string; // 'pending', 'approved', 'rejected'
  created_at: string; // Application creation date
}

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useUser();
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");
  
  // ✅ MERGED: Statistics state from enhanced version
  const [totalApplicants, setTotalApplicants] = useState<number>(0);
  const [approvedApplicantsCount, setApprovedApplicantsCount] = useState<number>(0);
  const [pendingApplicantsCount, setPendingApplicantsCount] = useState<number>(0);
  
  // ✅ NEW: Additional functionality states
  const [rejectedApplicantsCount, setRejectedApplicantsCount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  // ✅ MERGED: Enhanced fetch function with useCallback
  const fetchJobAndApplicants = useCallback(async () => {
    if (!profile?.id || !jobId) {
      setError("User or job ID not available.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch job details to get the title and verify ownership
      const { data: jobData, error: jobError } = await supabase
        .from("Job_Posts")
        .select("profession, company_id")
        .eq("id", parseInt(jobId))
        .single();

      if (jobError) throw jobError;
      if (!jobData || jobData.company_id !== profile.id) {
        setError("Job not found or you don't have permission to view applicants for this job.");
        setLoading(false);
        return;
      }
      setJobTitle(jobData.profession);

      // Fetch applications for this job
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("Applications")
        .select(`
          id,
          applicant_id,
          full_name,
          email,
          phone,
          resume_url,
          cover_letter_url,
          status,
          created_at
        `)
        .eq("job_id", parseInt(jobId))
        .order("created_at", { ascending: false }); // ✅ ENHANCED: Most recent first

      if (applicationsError) throw applicationsError;
      setApplicants(applicationsData as JobApplication[]);

      // ✅ MERGED: Calculate counts including rejected
      const total = applicationsData.length;
      const approved = applicationsData.filter(app => app.status === "approved").length;
      const pending = applicationsData.filter(app => app.status === "pending").length;
      const rejected = applicationsData.filter(app => app.status === "rejected").length;

      setTotalApplicants(total);
      setApprovedApplicantsCount(approved);
      setPendingApplicantsCount(pending);
      setRejectedApplicantsCount(rejected);

    } catch (err: any) {
      console.error("Error fetching job applicants:", err);
      setError(err.message || "Failed to fetch job applicants.");
    } finally {
      setLoading(false);
    }
  }, [jobId, profile?.id]);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [fetchJobAndApplicants]);

  // ✅ ENHANCED: Approve handler with individual loading states
  const handleApprove = async (applicationId: number) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));
    try {
      const { error } = await supabase
        .from("Applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      if (error) throw error;
      
      toast.success("Applicant approved!");
      
      // Update state immediately for better UX
      setApplicants(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: "approved" } : app
        )
      );
      
      // Refresh counts
      fetchJobAndApplicants();
    } catch (err: any) {
      console.error("Error approving applicant:", err);
      toast.error(err.message || "Failed to approve applicant.");
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // ✅ NEW: Reject handler
  const handleReject = async (applicationId: number) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));
    try {
      const { error } = await supabase
        .from("Applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;
      
      toast.success("Applicant rejected");
      
      // Update state immediately
      setApplicants(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: "rejected" } : app
        )
      );
      
      // Refresh counts
      fetchJobAndApplicants();
    } catch (err: any) {
      console.error("Error rejecting applicant:", err);
      toast.error(err.message || "Failed to reject applicant.");
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // ✅ NEW: Reset status to pending
  const handleResetToPending = async (applicationId: number) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));
    try {
      const { error } = await supabase
        .from("Applications")
        .update({ status: "pending" })
        .eq("id", applicationId);

      if (error) throw error;
      
      toast.success("Status reset to pending");
      
      // Update state immediately
      setApplicants(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: "pending" } : app
        )
      );
      
      // Refresh counts
      fetchJobAndApplicants();
    } catch (err: any) {
      console.error("Error resetting status:", err);
      toast.error(err.message || "Failed to reset status.");
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading applicants...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <AfterLoginNavbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to My Job Posts
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Applicants for "{jobTitle || "Job"}"
            </h1>
            <p className="text-gray-600 text-lg">
              Review profiles of professionals who applied to your job post.
            </p>
          </div>

          {/* ✅ MERGED: Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-gray-800 mb-1">{totalApplicants}</p>
              <p className="text-sm text-gray-500">Total Applications</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-green-600 mb-1">{approvedApplicantsCount}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-yellow-600 mb-1">{pendingApplicantsCount}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-3xl font-bold text-red-600 mb-1">{rejectedApplicantsCount}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>

          {/* Applicants List */}
          {applicants.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-6">
                  No professionals have applied for this job yet. Share your job post to attract more candidates.
                </p>
                <button
                  onClick={() => navigate("/my-job-posts")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to My Job Posts
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6"
                >
                  {/* Applicant Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {applicant.full_name}
                      </h3>
                      <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                        applicant.status === 'approved' ? 'bg-green-100 text-green-800' :
                        applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-gray-400" />
                      {applicant.email}
                    </p>
                    {applicant.phone && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        {applicant.phone}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(applicant.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mb-4">
                    {/* ✅ MERGED: View Profile Button */}
                    <button
                      onClick={() => {
                        console.log("Navigating to applicant profile for ID:", applicant.applicant_id);
                        navigate(`/public-profile/${encodeURIComponent(applicant.full_name)}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      View Profile
                    </button>

                    {/* Document Links */}
                    <div className="grid grid-cols-1 gap-2">
                      {applicant.resume_url && (
                        <a
                          href={applicant.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <FileText size={16} />
                          Resume
                        </a>
                      )}
                      {applicant.cover_letter_url && (
                        <a
                          href={applicant.cover_letter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <FileText size={16} />
                          Cover Letter
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ✅ ENHANCED: Status Actions */}
                  <div className="border-t border-gray-200 pt-4">
                    {applicant.status === "pending" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleApprove(applicant.id)}
                          disabled={actionLoading[applicant.id]}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={16} />
                          {actionLoading[applicant.id] ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(applicant.id)}
                          disabled={actionLoading[applicant.id]}
                          className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={16} />
                          {actionLoading[applicant.id] ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className={`w-full text-center py-2 px-4 rounded-lg text-sm font-medium ${
                          applicant.status === "approved" 
                            ? "text-green-700 bg-green-50 border border-green-200"
                            : "text-red-700 bg-red-50 border border-red-200"
                        }`}>
                          {applicant.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                        </div>
                        <button
                          onClick={() => handleResetToPending(applicant.id)}
                          disabled={actionLoading[applicant.id]}
                          className="w-full text-center text-gray-600 bg-gray-50 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading[applicant.id] ? "Resetting..." : "Reset to Pending"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

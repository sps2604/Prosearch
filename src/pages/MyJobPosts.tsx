import { useEffect, useState } from "react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import { type JobPost } from "../components/JobCard";
import { useUser } from "../context/UserContext";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function MyJobPosts() {
  const { profile } = useUser();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    const fetchMyJobPosts = async () => {
      if (!profile?.id) {
        setError("User not logged in or user ID not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error, count } = await supabase
          .from("Job_Posts")
          .select("*, company_name, deadline", { count: "exact" }) // ✅ MERGED: Include deadline and count
          .eq("company_id", profile.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setJobPosts(data || []);
        setTotalJobs(count || 0);
      } catch (e: any) {
        console.error("Error fetching job posts:", e);
        setError(`Failed to load job posts: ${e.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobPosts();
  }, [profile?.id, refreshTrigger]);

  // ✅ NEW: Handle refresh from location state
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshTrigger(prev => prev + 1);
      // Clear the refresh state so it doesn't trigger on subsequent visits
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refresh, location.pathname, navigate]);

  // ✅ NEW: Delete job handler
  const handleDelete = async (jobId: number) => {
    if (window.confirm("Are you sure you want to delete this job post? This action cannot be undone.")) {
      try {
        setLoading(true);
        
        // ✅ Enhanced: First delete related applications
        const { error: applicationsError } = await supabase
          .from("Applications")
          .delete()
          .eq("job_id", jobId);

        if (applicationsError) {
          console.warn("Warning: Could not delete related applications:", applicationsError);
        }

        // Delete the job post
        const { error } = await supabase
          .from("Job_Posts")
          .delete()
          .eq("id", jobId);

        if (error) {
          throw error;
        }

        toast.success("Job post deleted successfully!");
        setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
      } catch (e: any) {
        console.error("Error deleting job post:", e);
        toast.error(`Failed to delete job post: ${e.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ NEW: Navigate to post new job
  const handlePostNewJob = () => {
    navigate("/post-job");
  };

  // ✅ NEW: Navigate to edit job
  const handleEditJob = (jobId: number) => {
    navigate(`/edit-job/${jobId}`);
  };

  // ✅ NEW: Navigate to view applicants
  const handleViewApplicants = (jobId: number) => {
    navigate(`/my-job-posts/${jobId}/applicants`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      <AfterLoginNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Posts</h1>
            <p className="text-gray-600">
              {loading ? "Loading..." : `Manage your ${totalJobs} job ${totalJobs === 1 ? 'posting' : 'postings'}`}
            </p>
          </div>
          
          <button
            onClick={handlePostNewJob}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Post New Job
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : jobPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Job Posts Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't posted any jobs yet. Start by creating your first job posting to attract qualified candidates.
              </p>
              <button
                onClick={handlePostNewJob}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Post Your First Job
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ NEW: Jobs Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{totalJobs}</div>
                <div className="text-sm text-gray-600">Total Job Posts</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {jobPosts.filter(job => new Date(job.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-sm text-gray-600">Posted This Week</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">Active</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>

            {/* Job Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobPosts.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* ✅ Enhanced: Custom Job Card for My Posts */}
                  <div className="p-6">
                    {/* Job Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.profession}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.salary}</span>
                      </div>
                    </div>

                    {/* Job Description Preview */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {job.description || "No description provided"}
                    </p>

                    {/* Job Type Tags */}
                    {job.job_type && job.job_type.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.job_type.slice(0, 2).map((type, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                        {job.job_type.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{job.job_type.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Job Meta */}
                    <div className="text-xs text-gray-500 mb-4">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                      {job.deadline && (
                        <span className="block">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewApplicants(job.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Users size={16} />
                        View Applicants
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditJob(job.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

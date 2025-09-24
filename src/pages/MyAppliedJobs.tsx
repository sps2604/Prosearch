import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import JobCard, { type JobPost } from "../components/JobCard";
import { ArrowLeft } from "lucide-react";

interface AppliedJob {
  id: number;
  job_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  resume_url: string | null;
  cover_letter_url: string | null;
  created_at: string;
  Job_Posts: JobPost | null; // This will now be populated manually
}

export default function MyAppliedJobs() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!profile?.id) {
        setError("User not logged in or profile not loaded.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch applications first
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("Applications")
          .select(`
            id,
            job_id,
            full_name,
            email,
            phone,
            resume_url,
            cover_letter_url,
            created_at
          `)
          .eq("applicant_id", profile.id)
          .order("created_at", { ascending: false });

        if (applicationsError) throw applicationsError;
        if (!applicationsData) {
          setAppliedJobs([]);
          setLoading(false);
          return;
        }

        // 2. For each application, fetch the corresponding job post details
        const jobsPromises = applicationsData.map(async (application) => {
          const { data: jobPostData, error: jobPostError } = await supabase
            .from("Job_Posts")
            .select("*") // Select all fields needed by JobPost
            .eq("id", application.job_id)
            .single();
          
          if (jobPostError) {
            console.error("Error fetching job post for application", application.id, ":", jobPostError);
            // Return null or partial data if job post fetching fails
            return { ...application, Job_Posts: null };
          }
          return { ...application, Job_Posts: jobPostData as JobPost };
        });

        const populatedApplications = await Promise.all(jobsPromises);

        console.log(
          "Fetched applied jobs with relations:",
          JSON.stringify(populatedApplications, null, 2)
        );
        setAppliedJobs(populatedApplications);
      } catch (err: any) {
        console.error("Error fetching applied jobs:", err);
        setError(err.message || "Failed to fetch applied jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-700">Loading applied jobs...</p>
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
          <div className="text-center bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            <p>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-blue-600 hover:underline"
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
      <AfterLoginNavbar />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Applied Jobs</h1>
        <p className="text-gray-600 text-lg mb-8">
          Review the status and details of all jobs you've applied for.
        </p>

        {appliedJobs.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 text-lg">
              You haven't applied for any jobs yet.
            </p>
            <button
              onClick={() => navigate("/find-job")}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Find Jobs
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 space-y-6">
            {appliedJobs.map((application) => (
              <div
                key={application.id}
                // Removed redundant styling classes here, JobCard will handle its own styling
                className="mb-4"
              >
                {application.Job_Posts ? (
                  <JobCard
                    job={application.Job_Posts} 
                    hideApplyButton={true} // Hide apply button for applied jobs
                    onClick={() =>
                      navigate(`/job-details/${application.job_id}`)
                    }
                  />
                ) : (
                  <p className="text-gray-600">Job details not available.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";

// ✅ Define JobPost interface locally
interface JobPost {
  id: number;
  profession: string;
  description: string;
  location: string;
  salary: string;
  experience: string;
  job_type: string[];
  deadline?: string;
  company_name?: string;
  company_id?: number;
  created_at?: string;
}

// ✅ Define JobPostForm props interface
interface JobPostFormProps {
  initialData?: JobPost | null;
  isEditing?: boolean;
  jobId?: string;
  onSubmissionSuccess?: () => void | Promise<void>;
}

// ✅ Create a simple JobPostForm component or use your existing one
function JobPostForm({ initialData, isEditing = false, jobId, onSubmissionSuccess }: JobPostFormProps) {
  const [formData, setFormData] = useState({
    profession: initialData?.profession || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    salary: initialData?.salary || '',
    experience: initialData?.experience || '',
    job_type: initialData?.job_type || [],
    deadline: initialData?.deadline || '',
    company_name: initialData?.company_name || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && jobId) {
        // Update existing job
        const { error } = await supabase
          .from("Job_Posts")
          .update(formData)
          .eq("id", jobId);

        if (error) throw error;
      } else {
        // Create new job
        const { error } = await supabase
          .from("Job_Posts")
          .insert([formData]);

        if (error) throw error;
      }

      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save job post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          value={formData.profession}
          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Frontend Developer"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the job responsibilities and requirements..."
          required
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., New York, Remote"
          required
        />
      </div>

      {/* Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salary *
        </label>
        <input
          type="text"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., $50,000 - $70,000"
          required
        />
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Required
        </label>
        <select
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select experience level</option>
          <option value="Entry Level">Entry Level</option>
          <option value="1-2 years">1-2 years</option>
          <option value="3-5 years">3-5 years</option>
          <option value="5+ years">5+ years</option>
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Type
        </label>
        <div className="space-y-2">
          {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.job_type.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, job_type: [...formData.job_type, type] });
                  } else {
                    setFormData({ ...formData, job_type: formData.job_type.filter(t => t !== type) });
                  }
                }}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Application Deadline
        </label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your company name"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : isEditing ? "Update Job" : "Create Job"}
        </button>
      </div>
    </form>
  );
}

// ✅ Main EditJobPost component
export default function EditJobPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Job ID not provided.");
      setLoading(false);
      return;
    }

    const fetchJobPost = async () => {
      try {
        const { data, error } = await supabase
          .from("Job_Posts")
          .select("*, company_name, deadline")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setInitialData(data);
        } else {
          setError("Job post not found.");
        }
      } catch (e: any) {
        console.error("Error fetching job post for editing:", e);
        setError(`Failed to load job post: ${e.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Loading job post...</p>
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/my-job-posts')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Job Posts
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AfterLoginNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Found</h2>
            <p className="text-lg text-gray-700 mb-4">Job post not found.</p>
            <button
              onClick={() => navigate('/my-job-posts')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Job Posts
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
      
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/my-job-posts')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to My Job Posts
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900">Edit Job Post</h1>
            <p className="text-gray-600 mt-2">Update your job posting details</p>
          </div>

          {/* Form */}
          <JobPostForm 
            initialData={initialData} 
            isEditing={true} 
            jobId={id} 
            onSubmissionSuccess={() => navigate('/my-job-posts', { state: { refresh: true } })}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

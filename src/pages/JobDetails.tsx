import  { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, DollarSign, Building2, Calendar, Mail, Phone, Globe } from "lucide-react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import { type JobPost } from "../components/JobCard";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState<JobPost | null>(location.state?.job || null);
  const [loading, setLoading] = useState(!job);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    if (!job && id) {
      fetchJobDetails();
    }
    if (job?.company_id) {
      fetchCompanyInfo();
    }
  }, [id, job]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("Job_Posts")
        .select("*")
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
      const { data, error } = await supabase
        .from("Companies")
        .select("*")
        .eq("id", job.company_id)
        .single();

      if (error) throw error;
      setCompanyInfo(data);
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApplyNow = () => {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate("/find-job")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.profession}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 size={16} />
                      <span>{companyInfo?.name || `Company ID: ${job.company_id}`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleApplyNow}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </button>
              </div>

              {/* Job Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600">{job.salary}</span>
                </div>
                {job.experience && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{job.experience}</span>
                  </div>
                )}
              </div>

              {/* Job Types */}
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
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Company</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{companyInfo.name}</h4>
                    <p className="text-sm text-gray-600">Company</p>
                  </div>
                  
                  {companyInfo.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">
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
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {job.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${job.email}`} className="text-blue-600 hover:underline">
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
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply for this Job
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Globe, MapPin, DollarSign, Upload, FileText, X } from "lucide-react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import ProfileCardComponent from "../components/ProfileCardComponent"; // ✅ FIXED: Import reusable component
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function ApplyNow() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: any };
  const [params] = useSearchParams();
  const { profile } = useUser();

  const job = useMemo(() => {
    const stateJob = location.state?.job;
    if (stateJob) return stateJob;
    return {
      id: params.get("id"),
      profession: params.get("title"),
      company_id: params.get("company"),
      location: params.get("location"),
    };
  }, [location.state, params]);

  // ✅ UPDATED: Simplified form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New state for success popup
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // ✅ Pre-fill form with user data
  useEffect(() => {
    if (profile) {
      setFullName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      setEmail(profile.email || '');
      fetchUserProfile();
    }
  }, [profile]);

  // ✅ Fetch company info
  useEffect(() => {
    if (job?.company_id) {
      fetchCompanyInfo();
    }
  }, [job]);

  const fetchUserProfile = async () => {
    if (!profile?.id) return;
    
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data[0]) {
        setUserProfile(data[0]);
        if (data[0].mobile) setPhone(data[0].mobile);
        if (data[0].name && !fullName) setFullName(data[0].name);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchCompanyInfo = async () => {
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

  // ✅ Handle file uploads
  const uploadFile = async (
    file: File,
    bucketName: 'resumes' | 'coverletters',
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading to ${bucketName} bucket:`, error);
      return null;
    }
  };

  // ✅ Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a PDF or Word document');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      if (type === 'resume') {
        setResumeFile(file);
      } else {
        setCoverLetterFile(file);
      }
      setError(null);
    }
  };

  // ✅ Remove file
  const removeFile = (type: 'resume' | 'coverLetter') => {
    if (type === 'resume') {
      setResumeFile(null);
    } else {
      setCoverLetterFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!job?.id) {
        setError("Missing job information. Please go back and try again.");
        return;
      }

      let finalResumeUrl = resumeUrl;
      let finalCoverLetterUrl = null;

      // ✅ Upload files if selected
      if (uploadMode === "file") {
        if (resumeFile) {
          const uploadedResumeUrl = await uploadFile(resumeFile, 'resumes');
          if (uploadedResumeUrl) {
            finalResumeUrl = uploadedResumeUrl;
          } else {
            setError("Failed to upload resume. Please try again.");
            return;
          }
        }

        if (coverLetterFile) {
          const uploadedCoverLetterUrl = await uploadFile(coverLetterFile, 'coverletters');
          if (uploadedCoverLetterUrl) {
            finalCoverLetterUrl = uploadedCoverLetterUrl;
          } else {
            setError("Failed to upload cover letter. Please try again.");
            return;
          }
        }
      }

      const application = {
        job_id: job.id,
        applicant_id: user?.id,
        full_name: fullName,
        email: email,
        phone: phone || null,
        resume_url: finalResumeUrl || null,
        cover_letter_url: finalCoverLetterUrl || null,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("Applications")
        .insert([application]);
        
      if (insertError) throw insertError;

      setShowSuccessPopup(true); // Show success popup
      setSuccess(null); // Clear previous success message
      
      // Clear files
      setResumeFile(null);
      setCoverLetterFile(null);
      setResumeUrl("");
      
      // No longer redirect directly, popup will handle navigation
      // setTimeout(() => {
      //   navigate("/find-job");
      // }, 3000);
      
    } catch (err: any) {
      setError(err?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!job?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">Invalid job application link.</p>
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            {/* ✅ FIXED: User Profile Card */}
            {userProfile && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
                <ProfileCardComponent profile={userProfile} compact={true} />
              </div>
            )}

            {/* Job Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{job.profession}</h4>
                  <p className="text-sm text-gray-600">Position</p>
                </div>
                
                {job.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-700">{job.location}</span>
                  </div>
                )}
                
                {job.salary && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="text-gray-700">{job.salary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {companyInfo?.name && (
                  <div>
                    <h4 className="font-medium text-gray-900">{companyInfo.name}</h4>
                    <p className="text-sm text-gray-600">Company</p>
                  </div>
                )}
                
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
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> The employer will contact you directly using the information above if they're interested in your application.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Position</h1>
              <p className="text-gray-600 mb-6">
                You are applying for <span className="font-semibold text-blue-600">{job.profession}</span>
                {companyInfo?.name && ` at ${companyInfo.name}`}
              </p>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Application Documents */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Documents (Optional)</h3>
                  
                  {/* Upload Mode Toggle */}
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        uploadMode === "file" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Upload className="inline mr-2" size={16} />
                      Upload Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        uploadMode === "url" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Globe className="inline mr-2" size={16} />
                      Use URL
                    </button>
                  </div>

                  {uploadMode === "file" ? (
                    <>
                      {/* Resume Upload */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resume/CV
                        </label>
                        {!resumeFile ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              id="resume-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileSelect(e, 'resume')}
                              className="hidden"
                            />
                            <label htmlFor="resume-upload" className="cursor-pointer">
                              <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                              <p className="text-gray-600 mb-1">Click to upload resume</p>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <FileText size={20} className="text-blue-600" />
                            <span className="flex-1 text-sm font-medium">{resumeFile.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('resume')}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Upload */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cover Letter
                        </label>
                        {!coverLetterFile ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              id="cover-letter-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileSelect(e, 'coverLetter')}
                              className="hidden"
                            />
                            <label htmlFor="cover-letter-upload" className="cursor-pointer">
                              <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                              <p className="text-gray-600 mb-1">Click to upload cover letter</p>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <FileText size={20} className="text-blue-600" />
                            <span className="flex-1 text-sm font-medium">{coverLetterFile.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('coverLetter')}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* URL Mode */
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume/CV URL
                      </label>
                      <input
                        type="url"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Share a link to your resume (Google Drive, LinkedIn, etc.)
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !!success}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? "Submitting Application..." : success ? "Application Submitted!" : "Submit Application"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Success Popup Component (can be moved to a separate file if it grows more complex) */}
      {showSuccessPopup && (
        <SuccessPopup
          isOpen={showSuccessPopup}
          onNavigate={() => {
            setShowSuccessPopup(false);
            navigate("/find-job");
          }}
        />
      )}
    </div>
  );
}

// Success Popup Component (can be moved to a separate file if it grows more complex)
interface SuccessPopupProps {
  isOpen: boolean;
  onNavigate: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ isOpen, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
        <div className="text-green-500 mb-4">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Application Submitted!</h3>
        <p className="text-gray-600 mb-5">
          Your application has been successfully submitted. The employer will contact you if interested.
        </p>
        <button
          onClick={onNavigate}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse More Jobs
        </button>
      </div>
    </div>
  );
};

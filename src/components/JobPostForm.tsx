"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { type JobPost } from "../components/JobCard";

// ✅ NEW: Simple Modal component (inline since Modal import might not exist)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="mb-4">{children}</div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface JobFormData {
  company_name: string;
  profession: string;
  description: string;
  location: string;
  job_type: string[];
  salary: string;
  experience: string;
  skills: string;
  email: string;
  contact: string;
  website: string;
  deadline: string; // ✅ MERGED: Added deadline field
}

// ✅ MERGED: Enhanced props interface
interface JobPostFormProps {
  initialData?: JobPost; // For editing, pre-populate the form
  isEditing?: boolean; // Flag to indicate if the form is in edit mode
  jobId?: string; // The ID of the job being edited
  onSubmissionSuccess?: () => void; // Callback to run on successful form submission
}

const JobPostForm: React.FC<JobPostFormProps> = ({ 
  initialData, 
  isEditing = false, 
  jobId, 
  onSubmissionSuccess 
}) => {
  const [formData, setFormData] = useState<JobFormData>({
    company_name: "",
    profession: "",
    description: "",
    location: "",
    job_type: [],
    salary: "",
    experience: "",
    skills: "",
    email: "",
    contact: "",
    website: "",
    deadline: "", // ✅ MERGED: Added deadline field
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ MERGED: Added modal state
  const navigate = useNavigate();
  const { profile } = useUser();

  // ✅ MERGED: Effect to populate form when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        company_name: initialData.company_name || "",
        profession: initialData.profession || "",
        description: initialData.description || "",
        location: initialData.location || "",
        job_type: initialData.job_type || [],
        salary: initialData.salary || "",
        experience: initialData.experience || "",
        skills: initialData.skills?.join(", ") || "",
        email: initialData.email || "",
        contact: initialData.contact || "",
        website: initialData.website || "",
        deadline: initialData.deadline || "",
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => {
        let jobTypes = [...prev.job_type];
        if (checked) {
          jobTypes.push(value);
        } else {
          jobTypes = jobTypes.filter((item) => item !== value);
        }
        return { ...prev, job_type: jobTypes };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.company_name || formData.company_name.trim().length < 2) {
      toast.error("Company Name must be at least 2 characters long");
      return false;
    }
    if (!formData.profession) {
      toast.error("Please select a Profession");
      return false;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      toast.error("Description should be at least 10 characters long");
      return false;
    }
    if (!formData.location || formData.location.trim().length < 2) {
      toast.error("Please enter a valid Location");
      return false;
    }
    if (formData.job_type.length === 0) {
      toast.error("Select at least one Job Type");
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid Email");
      return false;
    }
    
    // Fields that are NOT NULL in database but not marked required in UI
    if (!formData.salary || formData.salary.trim().length < 1) {
      toast.error("Please enter salary information");
      return false;
    }
    if (!formData.contact || formData.contact.trim().length < 1) {
      toast.error("Please enter contact information");
      return false;
    }
    if (!formData.website || formData.website.trim().length < 1) {
      toast.error("Please enter company website");
      return false;
    }
    
    // Website URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (formData.website && !urlPattern.test(formData.website.trim())) {
      toast.error("Please enter a valid website URL");
      return false;
    }

    // ✅ NEW: Deadline validation
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (deadlineDate < today) {
        toast.error("Deadline cannot be in the past");
        return false;
      }
    }
    
    return true;
  };

  // ✅ MERGED: Enhanced form submission with edit support
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      console.log(isEditing ? "Updating job..." : "Creating job...");
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
      
      if (!user) {
        throw new Error("User not authenticated.");
      }
      if (profile?.user_type !== "business") {
        throw new Error("Only business users can post jobs.");
      }

      // Parse skills from comma-separated string to array
      const skillsArray = formData.skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0);

      const jobDataToSave = {
        profession: formData.profession,
        description: formData.description.trim(),
        location: formData.location.trim(),
        job_type: formData.job_type,
        salary: formData.salary.trim(),
        experience: formData.experience.trim() || 'Not specified',
        skills: skillsArray.length > 0 ? skillsArray : null,
        contact: formData.contact.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        deadline: formData.deadline || null, // ✅ MERGED: Include deadline
        company_id: profile.id,
        company_name: formData.company_name.trim(),
      };

      let response;
      if (isEditing && jobId) {
        // ✅ MERGED: Update existing job
        console.log("Updating job post...", jobId);
        response = await supabase
          .from("Job_Posts")
          .update(jobDataToSave)
          .eq("id", jobId);
        
        if (response.error) {
          console.error("Supabase update error:", response.error);
          throw response.error;
        }
        
        setShowSuccessModal(true); // Show modal for edit success
      } else {
        // ✅ MERGED: Create new job
        console.log("Creating job post...");
        const jobInsertPromise = supabase
          .from("Job_Posts")
          .insert(jobDataToSave)
          .select("id");

        const jobTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Job creation timed out')), 10000)
        );

        const { data: jobData, error: insertJobError } = await Promise.race([
          jobInsertPromise,
          jobTimeoutPromise
        ]) as any;

        if (insertJobError) {
          console.error("Error inserting job:", insertJobError);
          throw new Error(`Failed to post job: ${insertJobError.message}`);
        }

        console.log("Job posted successfully with ID:", jobData[0]?.id);
        toast.success("Job posted successfully!");

        // Clear form for new post
        setFormData({
          company_name: "",
          profession: "",
          description: "",
          location: "",
          job_type: [],
          salary: "",
          experience: "",
          skills: "",
          email: "",
          contact: "",
          website: "",
          deadline: "",
        });

        // Redirect to success page after a short delay
        setTimeout(() => navigate("/job-posted"), 1500);
      }

    } catch (err: any) {
      console.error("Error submitting job:", err);
      toast.error(err.message || "Failed to submit job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ MERGED: Modal close handler
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (onSubmissionSuccess) {
      onSubmissionSuccess();
    } else {
      navigate("/my-job-posts"); // Fallback navigation
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4 mt-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isEditing ? "Edit Job Post" : "Post Your Job"}
        </h2>

        <div>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Company Name *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="profession" className="block font-semibold mb-1 text-gray-700">
            Profession *
          </label>
          <select
            id="profession"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Profession</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
            <option value="Marketing Specialist">Marketing Specialist</option>
            <option value="Sales Representative">Sales Representative</option>
            <option value="Product Manager">Product Manager</option>
            <option value="HR Specialist">HR Specialist</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Job Description *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700">Job Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {["Full-time", "Internship", "Part-time", "Freelance", "Remote"].map(
              (type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="job_type"
                    value={type}
                    checked={formData.job_type.includes(type)}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              )
            )}
          </div>
        </div>

        <div>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Salary (e.g., ₹50,000 - ₹70,000) *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Experience Required (e.g., 2-5 years)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Skills Field */}
        <div>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Required Skills (e.g., React, Node.js, Python)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple skills with commas
          </p>
        </div>

        {/* ✅ MERGED: Deadline Field */}
        <div>
          <label htmlFor="deadline" className="block font-semibold mb-1 text-gray-700">
            Application Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Set a deadline for applications
          </p>
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Contact Email *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Contact Number *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Company Website *"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading 
            ? (isEditing ? "Updating Job..." : "Posting Job...") 
            : (isEditing ? "Update Job" : "Post Job")
          }
        </button>

        <p className="text-sm text-gray-500 text-center">
          * Required fields
        </p>
      </form>

      {/* ✅ MERGED: Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Update Successful"
      >
        <p className="text-gray-700">Your job post has been updated successfully!</p>
      </Modal>
    </>
  );
};

export default JobPostForm;

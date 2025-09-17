"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface JobFormData {
  company_name: string;
  profession: string;
  description: string;
  location: string;
  job_type: string[];
  salary: string;
  experience: string;
  email: string;
  contact: string;
  website: string;
}

const JobPostForm: React.FC = () => {
  const [formData, setFormData] = useState<JobFormData>({
    company_name: "",
    profession: "",
    description: "",
    location: "",
    job_type: [],
    salary: "",
    experience: "",
    email: "",
    contact: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      console.log("Starting job submission...");
      
      // Check if user is authenticated (optional)
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
      
      // Normalize company name for comparison (case-insensitive)
      const normalizedCompanyName = formData.company_name.trim().toLowerCase();
      console.log("Searching for company:", normalizedCompanyName);
      
      // 1. Check if company exists (case-insensitive search) - with timeout
      const companySearchPromise = supabase
        .from("Companies")
        .select("id, name")
        .ilike("name", normalizedCompanyName)
        .maybeSingle();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database operation timed out')), 10000)
      );

      const { data: companyData, error: companyFetchError } = await Promise.race([
        companySearchPromise,
        timeoutPromise
      ]) as any;

      if (companyFetchError) {
        console.error("Error fetching company:", companyFetchError);
        throw new Error("Failed to check company existence. Please try again.");
      }

      let companyId = companyData?.id;
      console.log("Company search result:", companyData);

      // 2. If company does not exist, insert it
      if (!companyId) {
        console.log("Creating new company...");
        
        // Ensure website has proper protocol
        let websiteUrl = formData.website.trim();
        if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
          websiteUrl = 'https://' + websiteUrl;
        }

        // Simplified company insertion - remove potential problematic fields
        const companyInsertPromise = supabase
          .from("Companies")
          .insert({
            name: formData.company_name.trim(),
            email: formData.email.trim(),
            contact: formData.contact.trim() || 'N/A',
            website: websiteUrl || 'https://example.com'
          })
          .select("id")
          .single();

        const companyTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Company creation timed out')), 10000)
        );

        const { data: newCompany, error: insertCompanyError } = await Promise.race([
          companyInsertPromise,
          companyTimeoutPromise
        ]) as any;

        if (insertCompanyError) {
          console.error("Error inserting company:", insertCompanyError);
          throw new Error(`Failed to create company: ${insertCompanyError.message}`);
        }
        
        companyId = newCompany.id;
        console.log("New company created with ID:", companyId);
      } else {
        console.log("Using existing company with ID:", companyId);
      }

      // 3. Insert job post with company_id
      console.log("Creating job post...");
      const jobInsertPromise = supabase
        .from("Job_Posts")
        .insert({
          profession: formData.profession,
          description: formData.description.trim(),
          location: formData.location.trim(),
          job_type: formData.job_type,
          salary: formData.salary.trim(),
          experience: formData.experience.trim() || 'Not specified',
          company_id: companyId,
        })
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

      // Clear form
      setFormData({
        company_name: "",
        profession: "",
        description: "",
        location: "",
        job_type: [],
        salary: "",
        experience: "",
        email: "",
        contact: "",
        website: "",
      });

      // Redirect to success page after a short delay
      setTimeout(() => navigate("/job-posted"), 1500);

    } catch (err: any) {
      console.error("Error posting job:", err);
      toast.error(err.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4 mt-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Post Your Job</h2>

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
            placeholder="Salary (e.g., $50,000 - $70,000) *"
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
          {loading ? "Posting Job..." : "Post Job"}
        </button>

        <p className="text-sm text-gray-500 text-center">
          * Required fields
        </p>
      </form>
    </>
  );
};

export default JobPostForm;


import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  
  Building2, 
  Calendar, 
  ExternalLink,
  PenSquare,
  Trash2,
  Users,
  IndianRupee
} from "lucide-react";

export interface JobPost {
  id: number;
  profession: string;
  company_id: string | null;
  company_name: string;
  description: string | null;
  location: string;
  job_type: string[];
  salary: string;
  experience: string | null;
  skills: string[] | null;
  contact: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  deadline?: string | null; // ✅ MERGED: Added deadline field
}

interface JobCardProps {
  job: JobPost;
  onClick?: () => void;
  showMatchingSkills?: string[];
  hideApplyButton?: boolean;
  // ✅ MERGED: Enhanced button control props
  showViewApplicantsButton?: boolean;
  onViewApplicantsClick?: () => void;
  showEditButton?: boolean;
  onEditClick?: () => void;
  showDeleteButton?: boolean;
  onDeleteClick?: () => void;
  // ✅ NEW: Additional display options
  variant?: 'default' | 'compact' | 'detailed';
  showSalaryIcon?: boolean;
}

export default function JobCard({ 
  job, 
  onClick, 
  showMatchingSkills, 
  hideApplyButton,
  showViewApplicantsButton,
  onViewApplicantsClick,
  showEditButton,
  onEditClick,
  showDeleteButton,
  onDeleteClick,
  
  showSalaryIcon = true
}: JobCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // ✅ NEW: Check if deadline is approaching
  const isDeadlineApproaching = () => {
    if (!job.deadline) return false;
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffInDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3 && diffInDays > 0;
  };

  // ✅ NEW: Check if deadline has passed
  const isDeadlinePassed = () => {
    if (!job.deadline) return false;
    return new Date(job.deadline) < new Date();
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/job-details/${job.id}`, { state: { job } });
  };

  const handleApplyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/apply-now", { state: { job } });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-300 p-6 relative ${
        isDeadlinePassed() ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
    >
      {/* ✅ MERGED: Edit and Delete Buttons - Top Right */}
      {(showEditButton || showDeleteButton) && (
        <div className="absolute top-3 right-3 flex space-x-2">
          {showEditButton && onEditClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              title="Edit Job Post"
            >
              <PenSquare size={16} />
            </button>
          )}
          {showDeleteButton && onDeleteClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 transition-colors"
              title="Delete Job Post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {job.profession}
            {/* ✅ NEW: Deadline warning indicator */}
            {isDeadlineApproaching() && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Deadline Soon
              </span>
            )}
            {isDeadlinePassed() && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                Expired
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Building2 size={14} />
            <span>{job.company_name || "Not specified"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 text-sm text-gray-500 ${
            showEditButton || showDeleteButton ? 'mt-5' : ''
          }`}>
            <Calendar size={14} />
            <span>{formatDate(job.created_at)}</span>
          </div>
          {/* ✅ MERGED: Deadline display */}
          {job.deadline && (
            <div className={`flex items-center gap-1 text-sm mt-1 ${
              isDeadlinePassed() ? 'text-red-600' : 
              isDeadlineApproaching() ? 'text-orange-600' : 'text-blue-500'
            }`}>
              <Calendar size={14} />
              <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {job.description.length > 100 
            ? `${job.description.substring(0, 100)}...` 
            : job.description
          }
        </p>
      )}

      {/* Job Details Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>

        {/* ✅ MERGED: Enhanced Salary Display */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {showSalaryIcon && <IndianRupee size={14} className="text-green-500 flex-shrink-0" />}
          <span className="truncate font-medium text-green-600">
            {showSalaryIcon ? job.salary : `₹ ${job.salary} Salary`}
          </span>
        </div>

        {/* Experience */}
        {job.experience && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.experience}</span>
          </div>
        )}

        {/* Job Type */}
        <div className="flex flex-wrap gap-1">
          {job.job_type && job.job_type.map((type, index) => (
            <span
              key={index}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Required Skills:</h4>
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 6).map((skill, index) => {
              const isMatching = showMatchingSkills?.includes(skill.toLowerCase());
              return (
                <span
                  key={index}
                  className={`inline-block text-xs px-2 py-1 rounded-full ${
                    isMatching
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {skill}
                  {isMatching && " ✓"}
                </span>
              );
            })}
            {job.skills.length > 6 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Match Indicator */}
      {showMatchingSkills && showMatchingSkills.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">
                {showMatchingSkills.length} skill match{showMatchingSkills.length > 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MERGED: Enhanced Action Buttons */}
      <div className="border-t border-gray-100 pt-4 flex gap-2 flex-wrap">
        <button 
          onClick={handleViewDetails}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <ExternalLink size={14} />
          View Details
        </button>
        
        {/* ✅ MERGED: View Applicants Button */}
        {showViewApplicantsButton && onViewApplicantsClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewApplicantsClick();
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Users size={14} />
            View Applicants
          </button>
        )}
        
        {/* Apply Button */}
        {!hideApplyButton && (
          <button 
            onClick={handleApplyNow}
            disabled={isDeadlinePassed()}
            className={`flex-1 min-w-[120px] py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
              isDeadlinePassed() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isDeadlinePassed() ? 'Deadline Passed' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { 
  Bell, 
  Briefcase, 
  CheckCircle2, 
  FileClock, 
  XCircle, 
  CheckCircle, 
  MessageSquare,
  User,
  Clock,
  MapPin,
  DollarSign,
  Building,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

// TypeScript interfaces for data types
interface JobPost {
  id: number;
  created_at: string;
  profession: string;
  description: string | null;
  location: string;
  job_type: string[];
  salary: string;
  experience: string | null;
  skills: string[] | null;
  contact: string | null;
  email: string | null;
  website: string | null;
  company_id: string | null;
  company_name: string | null;
}

interface Application {
  id: number;
  created_at: string;
  job_id: number | null;
  applicant_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  resume_url: string | null;
  cover_letter_url: string | null;
  status: string;
}

interface ApplicationWithJobPost extends Application {
  Job_Posts: JobPost | null;
}

interface UserProfile {
  id: string;
  name: string | null;
  profession: string | null;
  experience: number | null;
  skills: string | null;
  user_id: string;
  user_type: string;
}

// Mock notifications for businesses
interface MockNotification {
  id: number;
  type: "Job" | "Application" | "Message";
  title: string;
  description: string;
  company?: string;
  time: string;
  salary?: string;
  action: string;
  priority?: "high" | "medium" | "low";
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"professional" | "business" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [jobNotifications, setJobNotifications] = useState<JobPost[]>([]);
  const [myApplicationStatuses, setMyApplicationStatuses] = useState<ApplicationWithJobPost[]>([]);
  const [mockNotifications] = useState<MockNotification[]>([
    {
      id: 1,
      type: "Job",
      title: "New Job Match: Senior React Developer",
      description: "A new job posting matches your profile and search criteria. This remote position offers excellent benefits and growth opportunities.",
      company: "TechCorp Inc.",
      time: "2 minutes ago",
      salary: "$120k - $150k",
      action: "View Job",
      priority: "high"
    },
    {
      id: 2,
      type: "Application",
      title: "Application Status Update",
      description: "Your application for Frontend Engineer at StartupXYZ has been reviewed and moved to the interview stage.",
      time: "1 hour ago",
      action: "Schedule Interview",
      priority: "high"
    },
    {
      id: 3,
      type: "Message",
      title: "New Message from Sarah Johnson",
      description: "HR Manager at CloudTech has sent you a message regarding your recent application.",
      time: "3 hours ago",
      action: "Read Message",
      priority: "medium"
    },
    {
      id: 4,
      type: "Job",
      title: "Job Alert: 3 New Positions",
      description: "New job postings matching your saved search 'Full Stack Developer in San Francisco' are now available.",
      time: "6 hours ago",
      action: "View Jobs",
      priority: "medium"
    },
    {
      id: 5,
      type: "Application",
      title: "Application Deadline Reminder",
      description: "The application deadline for Product Manager at InnovateNow is approaching in 2 days.",
      time: "1 day ago",
      action: "Complete Application",
      priority: "low"
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "jobs" | "applications" | "messages">("all");

  // Handler function for Apply Now
  const handleApplyNow = (job: JobPost) => {
    navigate("/apply-now", { state: { job } });
  };

  useEffect(() => {
    async function loadUser() {
      try {
        console.log("🔍 Loading user...");
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("❌ Auth error:", error.message);
          return;
        }
        
        if (user) {
          console.log("✅ User found:", user.id);
          setUserId(user.id);
          
          // Determine user type from metadata
          const metadata = user.user_metadata;
          const userTypeFromDB = metadata?.user_type || "professional";
          setUserType(userTypeFromDB);
          
          if (userTypeFromDB === "professional") {
            await fetchUserSkills(user.id);
          }
        } else {
          console.log("❌ No user found");
        }
      } catch (error) {
        console.error("❌ Error loading user:", error);
      }
    }
    loadUser();
  }, []);

  // Fetch user skills from user_profiles table
  const fetchUserSkills = async (userId: string) => {
    try {
      console.log("🔍 Fetching skills from user_profiles for user:", userId);
      
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("skills, name, profession")
        .eq("user_id", userId)
        .eq("user_type", "professional")
        .single() as { data: UserProfile | null; error: any };

      if (error) {
        console.error("❌ Error fetching user profile:", error.message);
        setSkills([]);
        return;
      }

      if (profile) {
        console.log("✅ User profile found:", profile);
        
        if (profile.skills) {
          const skillsArray = profile.skills
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
          
          console.log("✅ User skills parsed:", skillsArray);
          setSkills(skillsArray);
        } else {
          console.log("⚠️ User profile found but no skills listed");
          setSkills([]);
        }
      } else {
        console.log("⚠️ No user profile found");
        setSkills([]);
      }
    } catch (error) {
      console.error("❌ Error fetching user skills:", error);
      setSkills([]);
    }
  };

  useEffect(() => {
    async function fetchJobs() {
      if (userType !== "professional") {
        setJobNotifications([]);
        setLoading(false);
        return;
      }

      try {
        if (skills.length === 0) {
          console.log("ℹ️ No user skills found, showing empty state");
          setJobNotifications([]);
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching jobs matching skills:", skills);
        
        const { data: allJobs, error } = await supabase
          .from("Job_Posts")
          .select("*")
          .order("created_at", { ascending: false }) as { data: JobPost[] | null; error: any };

        if (error) {
          console.error("❌ Error fetching jobs:", error.message);
          setJobNotifications([]);
        } else {
          const allJobsArray = allJobs || [];
          console.log(`✅ Fetched ${allJobsArray.length} total jobs`);
          
          const matchingJobs = allJobsArray.filter(job => {
            if (!job.skills || job.skills.length === 0) {
              return false;
            }
            
            const hasMatch = job.skills.some(jobSkill => 
              skills.some(userSkill => 
                userSkill.toLowerCase().trim() === jobSkill.toLowerCase().trim() ||
                userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
                jobSkill.toLowerCase().includes(userSkill.toLowerCase())
              )
            );
            
            return hasMatch;
          });
          
          console.log(`✅ Found ${matchingJobs.length} jobs matching user skills`);
          setJobNotifications(matchingJobs);
        }
      } catch (error) {
        console.error("❌ Error in fetchJobs:", error);
        setJobNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    if (userId && userType) {
      fetchJobs();
    }
  }, [userType, skills, userId]);

  useEffect(() => {
    async function fetchMyApplicationStatuses() {
      if (userType !== "professional" || !userId) {
        setMyApplicationStatuses([]);
        setLoading(false);
        return;
      }

      const { data: applications, error } = await supabase
        .from("Applications")
        .select(`
          *,
          Job_Posts (
            id,
            profession,
            company_name
          )
        `)
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false }) as { data: ApplicationWithJobPost[] | null, error: any };

      if (error) {
        console.error("Error fetching application statuses:", error.message);
      }
      setMyApplicationStatuses(applications || []);
      setLoading(false);
    }

    if (userId && userType === "professional") {
      fetchMyApplicationStatuses();
    }

    const subscription = supabase
      .channel(`public:Applications:applicant_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Applications',
          filter: `applicant_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime change received!', payload);
          fetchMyApplicationStatuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userType, userId]);

  // Function to get exactly matching skills between job and user
  const getMatchingSkills = (jobSkills: string[] | null): string[] => {
    if (!jobSkills || skills.length === 0) return [];
    return jobSkills.filter(jobSkill => 
      skills.some(userSkill => 
        userSkill.toLowerCase().trim() === jobSkill.toLowerCase().trim() ||
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
  };

  // Function to check if job is recent (posted in last 24 hours)
  const isRecentJob = (createdAt: string): boolean => {
    const jobDate = new Date(createdAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return jobDate > oneDayAgo;
  };

  // Get filtered notifications based on active tab
  const getFilteredNotifications = () => {
    if (userType === "professional") {
      // For professionals, show job notifications and applications
      if (activeTab === "all") {
        return {
          jobs: jobNotifications,
          applications: myApplicationStatuses
        };
      } else if (activeTab === "jobs") {
        return {
          jobs: jobNotifications,
          applications: []
        };
      } else if (activeTab === "applications") {
        return {
          jobs: [],
          applications: myApplicationStatuses
        };
      }
    } else {
      // For businesses, show mock notifications
      if (activeTab === "all") {
        return { mock: mockNotifications };
      } else {
        return { 
          mock: mockNotifications.filter(n => 
            activeTab === "jobs" ? n.type === "Job" :
            activeTab === "applications" ? n.type === "Application" :
            activeTab === "messages" ? n.type === "Message" : true
          )
        };
      }
    }
    return { jobs: [], applications: [], mock: [] };
  };

  const filteredData = getFilteredNotifications();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AfterLoginNavbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {userType === "professional" 
                    ? "Stay updated with job matches and application status"
                    : "Stay updated with your job posts and candidate activity"
                  }
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {userType === "professional" ? jobNotifications.length : mockNotifications.filter(n => n.type === "Job").length}
                    </div>
                    <div className="text-sm text-gray-600">Job Notifications</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {userType === "professional" ? myApplicationStatuses.length : mockNotifications.filter(n => n.type === "Application").length}
                    </div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {userType === "professional" ? 0 : mockNotifications.filter(n => n.type === "Message").length}
                    </div>
                    <div className="text-sm text-gray-600">Messages</div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Skills Display for Professionals */}
            {userType === "professional" && skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Your Skills:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-white rounded-lg p-1 border border-gray-200 w-fit">
            {["all", "jobs", "applications", ...(userType === "business" ? ["messages"] : [])].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab === "all" ? "All" : tab}
              </button>
            ))}
          </div>

          {/* Notifications Content */}
          <div className="space-y-6">
            {/* Professional Job Notifications */}
            {userType === "professional" && (filteredData.jobs || []).length > 0 && (
              <div>
                {activeTab === "all" && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Matching Jobs ({filteredData.jobs?.length || 0})
                  </h2>
                )}
                <div className="space-y-4">
                  {(filteredData.jobs || []).map((job: JobPost) => {
                    const matchingSkills = getMatchingSkills(job.skills);
                    const isNew = isRecentJob(job.created_at);
                    
                    return (
                      <div key={job.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${isNew ? 'ring-2 ring-blue-200' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4 flex-1">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <Briefcase className={`w-6 h-6 ${isNew ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{job.profession}</h3>
                                {isNew && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                    NEW
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  {matchingSkills.length} skill{matchingSkills.length !== 1 ? 's' : ''} match
                                </span>
                              </div>
                              
                              <p className="text-gray-600 mb-3">{job.description}</p>
                              
                              {/* Job Details */}
                              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  <span>{job.company_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-green-600 font-medium">{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              {/* Matching Skills */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs text-green-600 font-medium">Your matching skills:</span>
                                {matchingSkills.map((skill: string, idx: number) => (
                                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    {skill} ✓
                                  </span>
                                ))}
                              </div>
                              
                              {/* Other Required Skills */}
                              {job.skills && job.skills.length > matchingSkills.length && (
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs text-gray-500">Also requires:</span>
                                  {job.skills
                                    .filter(skill => !matchingSkills.includes(skill))
                                    .map((skill: string, idx: number) => (
                                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <a 
                              href={`/job-details/${job.id}`} 
                              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center transition-colors"
                            >
                              View Details
                            </a>
                            <button 
                              onClick={() => handleApplyNow(job)}
                              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 text-center transition-colors"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Professional Application Status */}
            {userType === "professional" && (filteredData.applications || []).length > 0 && (
              <div>
                {activeTab === "all" && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Application Status ({filteredData.applications?.length || 0})
                  </h2>
                )}
                <div className="space-y-4">
                  {(filteredData.applications || []).map((app: ApplicationWithJobPost) => {
                    const statusConfig = {
                      pending: { icon: FileClock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
                      accepted: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
                      rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
                    }[app.status] || { icon: FileClock, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
                    const Icon = statusConfig.icon;

                    return (
                      <div key={app.id} className={`bg-white rounded-xl shadow-sm border ${statusConfig.borderColor} p-6`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${statusConfig.bgColor} rounded-full`}>
                            <Icon className={`w-6 h-6 ${statusConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {app.Job_Posts?.profession || `Job #${app.job_id}`}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              Applied to <span className="font-medium">{app.Job_Posts?.company_name || 'a company'}</span>
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(app.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business Mock Notifications */}
            {userType === "business" && (filteredData.mock || []).length > 0 && (
              <div className="space-y-4">
                {(filteredData.mock || []).map((notification: MockNotification) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case "Job": return Briefcase;
                      case "Application": return CheckCircle2;
                      case "Message": return MessageSquare;
                      default: return Bell;
                    }
                  };
                  
                  const getColorClasses = (type: string) => {
                    switch (type) {
                      case "Job": return { icon: "text-blue-600", bg: "bg-blue-100" };
                      case "Application": return { icon: "text-green-600", bg: "bg-green-100" };
                      case "Message": return { icon: "text-purple-600", bg: "bg-purple-100" };
                      default: return { icon: "text-gray-600", bg: "bg-gray-100" };
                    }
                  };

                  const Icon = getIcon(notification.type);
                  const colors = getColorClasses(notification.type);

                  return (
                    <div key={notification.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 flex-1">
                          <div className={`p-3 ${colors.bg} rounded-full`}>
                            <Icon className={`w-6 h-6 ${colors.icon}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
                            <p className="text-gray-600 mb-3">{notification.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{notification.time}</span>
                              </div>
                              {notification.company && (
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  <span>{notification.company}</span>
                                </div>
                              )}
                              {notification.salary && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-green-600 font-medium">{notification.salary}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          {notification.action}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty States */}
            {!loading && (
              <>
                {/* Professional Empty States */}
                {userType === "professional" && activeTab === "jobs" && jobNotifications.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Job Matches Found</h3>
                    {skills.length === 0 ? (
                      <div className="text-gray-500 max-w-md mx-auto">
                        <p className="mb-4">Update your profile with skills to receive personalized job notifications.</p>
                        <button
                          onClick={() => navigate("/edit-profile")}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          Update Profile
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 max-w-md mx-auto">
                        <p className="mb-2">No jobs currently match your skills.</p>
                        <p className="text-sm">
                          We'll notify you when new positions are posted matching: <strong>{skills.join(", ")}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {userType === "professional" && activeTab === "applications" && myApplicationStatuses.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start applying to jobs and track your application status here.
                    </p>
                    <button
                      onClick={() => navigate("/find-job")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Briefcase className="w-5 h-5" />
                      Browse Jobs
                    </button>
                  </div>
                )}

                {/* Business Empty State */}
                {userType === "business" && (filteredData.mock || []).length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bell className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      You're all caught up! New notifications will appear here.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

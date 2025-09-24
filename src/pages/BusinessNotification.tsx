import { useState, useEffect } from "react";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  Briefcase
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import toast, { Toaster } from "react-hot-toast";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
);

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

interface JobPost {
  id: number;
  profession: string;
  company_name: string | null;
}

interface ApplicationWithJob extends Application {
  Job_Posts?: JobPost;
}

export default function BusinessmanNotificationsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [applicationNotifications, setApplicationNotifications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchApplications() {
      if (!userId) {
        setApplicationNotifications([]);
        setLoading(false);
        return;
      }

      const { data: jobs } = await supabase
        .from("Job_Posts")
        .select("id")
        .eq("company_id", userId) as { data: Pick<JobPost, 'id'>[] | null };
      const jobIds = (jobs || []).map((j: Pick<JobPost, 'id'>) => j.id);
      if (!jobIds.length) {
        setApplicationNotifications([]);
        setLoading(false);
        return;
      }

      const { data: applications } = await supabase
        .from("Applications")
        .select(`
          *,
          Job_Posts (
            id,
            profession,
            company_name
          )
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false }) as { data: ApplicationWithJob[] | null };

      setApplicationNotifications(applications || []);
      setLoading(false);
    }
    fetchApplications();
  }, [userId]);

  // Handle Accept/Reject
  const handleStatusChange = async (
    app: ApplicationWithJob,
    newStatus: "accepted" | "rejected"
  ) => {
    setUpdatingId(app.id);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    
    try {
      const { error } = await supabase
        .from("Applications")
        .update({ status: newStatus })
        .eq("id", app.id)
        .select();

      if (error) {
        throw error;
      }

      toast.success(`Applicant ${newStatus}. Email notification sent.`, { id: toastId });
      
      // Send status email
      window.fetch("/api/send-status-mail", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: app.email,
          applicantName: app.full_name,
          jobTitle: app.Job_Posts?.profession || "",
          status: newStatus,
        }),
      });
      
      setApplicationNotifications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`, { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter applications based on status
  const filteredApplications = applicationNotifications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  // Get status counts
  const statusCounts = {
    all: applicationNotifications.length,
    pending: applicationNotifications.filter(app => app.status === 'pending').length,
    accepted: applicationNotifications.filter(app => app.status === 'accepted').length,
    rejected: applicationNotifications.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AfterLoginNavbar />
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Application Notifications</h1>
          </div>
          <p className="text-gray-600">
            Stay updated with new applications for your job postings and manage applicant responses.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{statusCounts.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-1">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All Applications', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app: ApplicationWithJob) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Application Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="mt-1">
                        {app.status === 'pending' && (
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                        )}
                        {app.status === 'accepted' && (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        {app.status === 'rejected' && (
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <X className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {app.full_name}
                            </h3>
                            <p className="text-gray-600 flex items-center gap-2">
                              <Briefcase size={16} />
                              Applied for: {app.Job_Posts?.profession || `Job #${app.job_id}`}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                          {app.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} />
                              <span>{app.email}</span>
                            </div>
                          )}
                          {app.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              <span>{app.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {app.resume_url && (
                            <a
                              href={app.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                            >
                              <FileText size={14} />
                              View Resume
                            </a>
                          )}
                          {app.cover_letter_url && (
                            <a
                              href={app.cover_letter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <FileText size={14} />
                              View Cover Letter
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <a
                      href={`/profile-card/user/${app.applicant_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <User size={16} />
                      View Profile
                    </a>
                    
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(app, "accepted")}
                          disabled={updatingId === app.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={16} />
                          {updatingId === app.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(app, "rejected")}
                          disabled={updatingId === app.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={16} />
                          {updatingId === app.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'New applications for your job postings will appear here.'
                  : `Applications with ${filter} status will appear here.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Applications
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

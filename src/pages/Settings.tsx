import { useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import {
  User,
  Settings,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Moon,
  Sun,
  Monitor,
  Globe,
  Eye,
  Edit,
  Trash2,
  Shield,
  Phone,
} from "lucide-react";

type Tab = "account" | "email" | "privacy" | "job-alerts" | "billing" | "additional";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme, toggleDarkMode } = useTheme();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [active, setActive] = useState<Tab>("account");
  const [deleting, setDeleting] = useState(false);
  const [prefs, setPrefs] = useState({ 
    jobAlerts: true, 
    tips: true, 
    marketing: false, 
    surveys: false 
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!profile?.id) return;
      
      try {
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        if (data) {
          setPrefs({
            jobAlerts: data.email_job_alerts ?? true,
            tips: data.email_tips ?? true,
            marketing: data.email_marketing ?? false,
            surveys: data.email_surveys ?? false,
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [profile?.id]);

  const sidebarItem = (key: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => key === 'job-alerts' ? navigate('/notifications') : setActive(key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left border transition-all duration-200 ${
        active === key
          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const handleView = () => navigate("/profile");
  const handleResetPassword = () => navigate("/reset-password");
  const handleEdit = () => navigate("/edit-profile");

  const handleDelete = async () => {
    if (!profile) return navigate("/login");
    const confirmMessage = "Are you sure you want to delete your profile? This action cannot be undone.";
    const ok = confirm(confirmMessage);
    if (!ok) return;
    
    setDeleting(true);
    try {
      // Delete latest profile record
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", profile.id);
      if (error) throw error;
      
      alert("Profile deleted successfully. You will be redirected to create a new profile.");
      navigate("/create-profile");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setDeleting(false);
    }
  };

  const savePreferences = async () => {
    if (!profile) {
      navigate('/login');
      return;
    }
    
    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          email_job_alerts: prefs.jobAlerts,
          email_tips: prefs.tips,
          email_marketing: prefs.marketing,
          email_surveys: prefs.surveys,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AfterLoginNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AfterLoginNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and configurations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 px-2">Account Settings</h2>
              {sidebarItem("account", "Account", <User size={18} />)}
              {sidebarItem("additional", "Preferences", <Settings size={18} />)}
              {sidebarItem("email", "Email Preferences", <Mail size={18} />)}
              {sidebarItem("privacy", "Privacy & Help", <Lock size={18} />)}
              {sidebarItem("job-alerts", "Job Alerts", <Bell size={18} />)}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              {/* Account Tab */}
              {active === "account" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Management</h2>
                    <p className="text-gray-600 mb-6">Manage your profile and account settings</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleView} 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={18} />
                      View Profile
                    </button>
                    
                    <button 
                      onClick={handleEdit} 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                    >
                      <Edit size={18} />
                      Edit Profile
                    </button>
                    
                    <button 
                      onClick={handleResetPassword} 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <Shield size={18} />
                      Reset Password
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                      {deleting ? "Deleting..." : "Delete Profile"}
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 mb-1">Important Notes</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Profile changes may take a few minutes to reflect across the platform</li>
                      <li>• Deleting your profile will permanently remove all your data</li>
                      <li>• Password reset will send a link to your registered email</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Email Preferences Tab */}
              {active === "email" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Preferences</h2>
                    <p className="text-gray-600 mb-6">Customize which emails you receive from us</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Job Alert Emails</h3>
                          <p className="text-sm text-gray-600">Receive notifications about new job opportunities</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.jobAlerts} 
                          onChange={(e) => setPrefs(p => ({...p, jobAlerts: e.target.checked}))} 
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Career Tips Newsletter</h3>
                          <p className="text-sm text-gray-600">Weekly tips and advice for career growth</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.tips} 
                          onChange={(e) => setPrefs(p => ({...p, tips: e.target.checked}))} 
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                          <p className="text-sm text-gray-600">Promotional offers and platform updates</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.marketing} 
                          onChange={(e) => setPrefs(p => ({...p, marketing: e.target.checked}))} 
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Feedback Surveys</h3>
                          <p className="text-sm text-gray-600">Help us improve with occasional feedback requests</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.surveys} 
                          onChange={(e) => setPrefs(p => ({...p, surveys: e.target.checked}))} 
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </label>
                    </div>

                    <button
                      onClick={savePreferences}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={savingPrefs}
                    >
                      <Mail size={18} />
                      {savingPrefs ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy & Help Tab */}
              {active === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy & Help</h2>
                    <p className="text-gray-600 mb-6">Privacy information and support resources</p>
                  </div>

                  <div className="space-y-4">
                    {/* Policy Links */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Legal & Privacy</h3>
                      <a 
                        href="/how-to/privacy" 
                        className="block px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                      >
                        User Agreement, Privacy Policy, and Cookie Policy
                      </a>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        <details className="bg-white rounded-lg border border-gray-200 p-4">
                          <summary className="cursor-pointer font-medium text-gray-900">How do I reset my password?</summary>
                          <p className="mt-2 text-sm text-gray-600">Go to Settings → Account → Reset Password, enter a new password, and save your changes.</p>
                        </details>
                        
                        <details className="bg-white rounded-lg border border-gray-200 p-4">
                          <summary className="cursor-pointer font-medium text-gray-900">How do I manage email notifications?</summary>
                          <p className="mt-2 text-sm text-gray-600">Navigate to Settings → Email Preferences. Toggle the options you prefer and click Save Preferences.</p>
                        </details>
                        
                        <details className="bg-white rounded-lg border border-gray-200 p-4">
                          <summary className="cursor-pointer font-medium text-gray-900">How can I change language and theme?</summary>
                          <p className="mt-2 text-sm text-gray-600">Go to Settings → Preferences. Choose your preferred language and select Light/Dark/System theme.</p>
                        </details>
                        
                        <details className="bg-white rounded-lg border border-gray-200 p-4">
                          <summary className="cursor-pointer font-medium text-gray-900">Where do I see job alerts?</summary>
                          <p className="mt-2 text-sm text-gray-600">Open Notifications from the top navigation bar or click Job Alerts in the Settings menu.</p>
                        </details>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Contact Support</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <a 
                          href="mailto:hr@professionalsearch.in" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Mail size={18} />
                          hr@professionalsearch.in
                        </a>
                        <a 
                          href="tel:+918999866172" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Phone size={18} />
                          +91 89998 66172
                        </a>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Follow Us</h4>
                        <div className="flex gap-3">
                          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">LinkedIn</a>
                          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-800">Instagram</a>
                          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-blue-800 hover:text-blue-900">Facebook</a>
                          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">Twitter</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab (Additional) */}
              {active === "additional" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h2>
                    <p className="text-gray-600 mb-6">Customize your experience with theme and language settings</p>
                  </div>

                  {/* Theme Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Monitor size={18} />
                      Theme Settings
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Choose how the interface appears</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          resolvedTheme === "light" && theme !== "system" 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Sun size={16} />
                        Light
                      </button>
                      
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          resolvedTheme === "dark" && theme !== "system" 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Moon size={16} />
                        Dark
                      </button>
                      
                      <button
                        onClick={() => setTheme("system")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          theme === "system" 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Monitor size={16} />
                        System
                      </button>
                      
                      <button 
                        onClick={toggleDarkMode} 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        Toggle
                      </button>
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Globe size={18} />
                      Language Settings
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Choose your preferred language</p>
                    
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="gu">ગુજરાતી (Gujarati)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada)</option>
                      <option value="ml">മലയാളം (Malayalam)</option>
                      <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Coming Soon for other tabs */}
              {active === "billing" && (
                <div className="text-center py-12">
                  <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Billing & Subscriptions</h3>
                  <p className="text-gray-600">This feature is coming soon. Stay tuned for premium features!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

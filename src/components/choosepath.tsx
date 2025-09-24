import { User, Building2, Search, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ChoosePath() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const paths = [
    {
      id: "professional",
      title: "I'm a Professional",
      subtitle: "Looking for work opportunities",
      icon: User,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
      features: [
        "Create your professional profile",
        "Browse and apply for jobs",
        "Showcase your skills and experience",
        "Connect with top companies"
      ],
      actions: [
        {
          label: profile ? "Browse Jobs" : "Get Started",
          primary: true,
          onClick: () => {
            if (profile?.user_type === "professional") {
              navigate("/find-job");
            } else {
              navigate("/register/professional"); // ✅ FIXED: Correct route path
            }
          }
        },
        {
          label: "View Sample Profiles",
          primary: false,
          onClick: () => navigate("/find-job") // ✅ FIXED: Use existing route
        }
      ]
    },
    {
      id: "business",
      title: "I'm a Business",
      subtitle: "Looking to hire talent",
      icon: Building2,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-100",
      features: [
        "Post job openings",
        "Find qualified candidates",
        "Manage applications",
        "Build your company profile"
      ],
      actions: [
        {
          label: profile ? "Post a Job" : "Get Started",
          primary: true,
          onClick: () => {
            if (profile?.user_type === "business") {
              navigate("/post-job");
            } else {
              navigate("/register/business"); // ✅ FIXED: Correct route path
            }
          }
        },
        {
          label: "Browse Professionals",
          primary: false,
          onClick: () => navigate("/find-job") // ✅ FIXED: Use existing route
        }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're seeking opportunities or looking to hire, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {paths.map((path) => (
            <div
              key={path.id}
              className={`${path.bgColor} ${path.borderColor} border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg ${path.hoverColor} group`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full bg-white shadow-sm`}>
                  <path.icon className={`w-8 h-8 ${path.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {path.title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {path.subtitle}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {path.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${path.iconColor} flex-shrink-0`} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {path.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      action.primary
                        ? `text-white shadow-sm`
                        : `bg-white border`
                    }`}
                    style={
                      action.primary
                        ? {
                            backgroundColor: path.color === 'blue' ? '#2563eb' : '#ea580c',
                          }
                        : {
                            color: path.color === 'blue' ? '#2563eb' : '#ea580c',
                            borderColor: path.color === 'blue' ? '#dbeafe' : '#fed7aa',
                          }
                    }
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Stats or Additional Info */}
              <div className="mt-6 pt-6 border-t border-white/50">
                <div className="flex justify-between text-sm text-gray-600">
                  {path.id === "professional" ? (
                    <>
                      <span>Join 500+ professionals</span>
                      <span>50+ active jobs</span>
                    </>
                  ) : (
                    <>
                      <span>Join 100+ companies</span>
                      <span>1000+ applications</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional CTA Section */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-4">
            <Search className="w-4 h-4" />
            <span>Not sure? Browse our platform first</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/find-job")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5" />
              Browse Jobs
            </button>
            <button
              onClick={() => navigate("/find-job")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5" />
              Browse Professionals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

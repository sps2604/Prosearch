import { useParams, useNavigate } from "react-router-dom";
import AfterLoginNavbar from "../components/AfterLoginNavbar";
import Footer from "../components/footer";
import React, { useState } from "react";
import SearchBar from "../components/search_bar";

export default function HowTo() {
  // Explicit type for useParams to avoid implicit 'any'
  const { topic } = useParams<{ topic?: string }>();
  const navigate = useNavigate();

  const renderContent = () => {
    switch (topic) {
      case "apply-job":
        return (
          <>
            <h1 className="text-3xl font-bold mb-4">How to Apply for a Job?</h1>
            <p className="mb-8 text-gray-600">
              Follow these steps to land your next opportunity.
            </p>
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              <StepCard
                step="1"
                title="Search & Filter Jobs"
                icon="fas fa-search"
                text="Use advanced filters to find jobs by location, salary, and more."
                theme="blue"
              />
              <StepCard
                step="2"
                title="Complete Your Application"
                icon="fas fa-file-alt"
                text="Upload resume, write cover letters, and review job requirements."
                theme="blue"
              />
              <StepCard
                step="3"
                title="Submit & Track Applications"
                icon="fas fa-paper-plane"
                text="Track your application status and get notified of updates."
                theme="blue"
              />
            </div>
            <button
              className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 block mx-auto"
              onClick={() => navigate("/find-job")}
            >
              Start Applying Now
            </button>
          </>
        );

      case "post-job":
        return (
          <>
            <h1 className="text-3xl font-bold mb-4">How to Post a Job?</h1>
            <p className="mb-8 text-gray-600">
              Follow these steps to post your first job and attract top talent.
            </p>
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              <StepCard
                step="1"
                title="Create Detailed Job Posting"
                icon="fas fa-pen"
                text="Write compelling job descriptions with clear instructions."
                theme="green"
              />
              <StepCard
                step="2"
                title="Set Up Company Profile"
                icon="fas fa-users"
                text="Showcase your workplace culture and attract top candidates."
                theme="green"
              />
              <StepCard
                step="3"
                title="Review & Manage Applications"
                icon="fas fa-eye"
                text="Screen applications and schedule interviews efficiently."
                theme="green"
              />
            </div>
            <button
              className="mt-8 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 block mx-auto"
              onClick={() => navigate("/post-job")}
            >
              Post Your First Job
            </button>
          </>
        );

      case "search-professionals":
        return <SearchProfessionalsSection />;

      default:
        return <h2 className="text-center text-xl">Invalid Topic</h2>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AfterLoginNavbar />
      <main className="flex-1 px-6 py-12 max-w-5xl mx-auto">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

// --- StepCard Component with proper types ---
type StepCardProps = {
  step: string;
  title: string;
  icon: string;
  text: string;
  highlight?: boolean;
  theme?: "blue" | "green" | "yellow"; // visual theme
};

function StepCard({ step, title, icon, text, highlight = false, theme = "blue" }: StepCardProps) {
  const colorMap: Record<string, { border: string; hoverBorder: string; icon: string; badge: string; highlightBorder: string; highlightIcon: string; highlightBadge: string }> = {
    blue: {
      border: "border-gray-100",
      hoverBorder: "hover:border-blue-300",
      icon: "text-blue-600",
      badge: "bg-blue-50",
      highlightBorder: "border-2 border-blue-500",
      highlightIcon: "text-blue-600",
      highlightBadge: "bg-blue-50",
    },
    green: {
      border: "border-gray-100",
      hoverBorder: "hover:border-green-300",
      icon: "text-green-600",
      badge: "bg-green-50",
      highlightBorder: "border-2 border-green-500",
      highlightIcon: "text-green-600",
      highlightBadge: "bg-green-50",
    },
    yellow: {
      border: "border-gray-100",
      hoverBorder: "hover:border-yellow-300",
      icon: "text-yellow-600",
      badge: "bg-yellow-50",
      highlightBorder: "border-2 border-yellow-400",
      highlightIcon: "text-yellow-600",
      highlightBadge: "bg-yellow-50",
    },
  };

  const themeCls = colorMap[theme];
  const container = highlight ? themeCls.highlightBorder + " shadow-lg" : "border " + themeCls.border + " shadow-md";
  const iconColor = highlight ? themeCls.highlightIcon : themeCls.icon;
  const badgeBg = highlight ? themeCls.highlightBadge : themeCls.badge;

  // On hover, apply the themed border to any card, not just highlighted ones
  return (
    <div className={`bg-white ${container} rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${themeCls.hoverBorder}`}>
      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${badgeBg} mx-auto mb-4`}>
        <i className={`${icon} text-xl ${iconColor}`} aria-hidden="true"></i>
      </div>
      <h3 className="text-base font-bold text-gray-800">Step {step}</h3>
      <h4 className="text-lg font-semibold mt-2 text-gray-900">{title}</h4>
      <p className="text-gray-600 mt-3 leading-relaxed">{text}</p>
    </div>
  );
}

// --- Search Professionals Section ---
function SearchProfessionalsSection() {
  const [profession, setProfession] = useState("");
  const [trigger, setTrigger] = useState(0);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setTrigger((t) => t + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">Search Professionals</h1>
      <p className="mb-8 text-gray-600 text-center">
        Find skilled professionals in your domain.
      </p>

      {/* Centered single input with button (like screenshot) */}
      <div className="flex items-center gap-3 justify-center">
        <input
          type="text"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Search professionals..."
          className="w-full md:w-[600px] px-4 py-3 border rounded-xl"
        />
        <button
          onClick={() => setTrigger((t) => t + 1)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Results */}
      <div className="mt-6">
        <SearchBar
          initialQuery={profession}
          forceSearchKey={trigger}
          renderInput={false}
          autoSearchOnChange={false}
        />
      </div>

      {/* Optional steps below to match the three-card layout */}
      <div className="grid md:grid-cols-3 gap-6 mt-10 items-stretch">
        <StepCard
          step="1"
          title="Browse Talent Profiles"
          icon="fas fa-user-tie"
          text="Use filters to find professionals with the right skills."
          theme="yellow"
        />
        <StepCard
          step="2"
          title="Check Experience"
          icon="fas fa-briefcase"
          text="Review their work history, ratings, and portfolio."
          theme="yellow"
        />
        <StepCard
          step="3"
          title="Hire & Collaborate"
          icon="fas fa-handshake"
          text="Connect and collaborate with professionals directly."
          theme="yellow"
        />
      </div>
    </div>
  );
}

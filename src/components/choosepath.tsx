import React from "react";
import { Briefcase, Building2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChoosePath() {
  const navigate = useNavigate();

  const paths: {
    title: string;
    desc: string;
    btnText: string;
    btnColor: string;
    icon: React.ReactElement;
    route: string;
  }[] = [
    {
      title: "Professionals",
      desc: "Create your profile, showcase skills, and connect with recruiters & employers for freelance, part-time, or full-time opportunities.",
      btnText: "Start Now",
      btnColor: "bg-blue-600 hover:bg-blue-700",
      icon: <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />,
      route: "/professionals",
    },
    {
      title: "Recruiters & Employers",
      desc: "Post job opportunities and find skilled professionals across multiple domains with verified profiles and quick hiring tools.",
      btnText: "Post a Job",
      btnColor: "bg-yellow-500 hover:bg-yellow-600",
      icon: <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-4" />,
      route: "/post-job",
    },
    {
      title: "General Users",
      desc: "Search and explore professionals across different fields for services, projects, or collaborations with ease.",
      btnText: "Start Now",
      btnColor: "bg-green-600 hover:bg-green-700",
      icon: <Users className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-4" />,
      route: "/general-users",
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-white">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 sm:mb-10">
          Choose Your Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paths.map((item, i) => (
            <div
              key={i}
              className="p-6 sm:p-8 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-full"
            >
              <div>
                {item.icon}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-6">{item.desc}</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate(item.route)}
                  className={`px-5 py-3 text-white rounded-lg font-medium transition ${item.btnColor} text-sm sm:text-base`}
                >
                  {item.btnText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

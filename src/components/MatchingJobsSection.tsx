import  { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import JobCard, { type JobPost } from "./JobCard";
import { useUser } from "../context/UserContext";
import { Sparkles, Briefcase } from "lucide-react";

export default function MatchingJobsSection() {
  const [matchingJobs, setMatchingJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const { profile } = useUser();

  useEffect(() => {
    if (profile?.user_type === "professional") {
      fetchMatchingJobs();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchMatchingJobs = async () => {
    try {
      setLoading(true);
      console.log("🔍 Starting fetchMatchingJobs for user:", profile?.id);

      // ✅ FIXED: Use .limit(1) instead of .single() to handle duplicates
      const { data: userProfiles, error: userError } = await supabase
        .from("user_profiles")
        .select("user_id, skills")
        .eq("user_id", profile?.id)
        .order("created_at", { ascending: false }) // Get the most recent one
        .limit(1);

      console.log("🔍 Database query result:", { userProfiles, userError });

      if (userError) {
        console.error("❌ Error fetching user profile:", userError);
        setMatchingJobs([]);
        setLoading(false);
        return;
      }

      if (!userProfiles || userProfiles.length === 0) {
        console.log("❌ No user profile found in database");
        setMatchingJobs([]);
        setLoading(false);
        return;
      }

      const userProfile = userProfiles[0]; // Get the first (most recent) profile

      if (!userProfile.skills || userProfile.skills.trim() === "") {
        console.log("❌ User profile found but no skills:", userProfile);
        setMatchingJobs([]);
        setLoading(false);
        return;
      }

      console.log("✅ User skills from database:", userProfile.skills);

      // Parse user skills (comma-separated string)
      const skills = userProfile.skills
        .split(',')
        .map((skill: string) => skill.trim().toLowerCase())
        .filter((skill: string) => skill.length > 0);

      console.log("🎯 Parsed user skills:", skills);
      setUserSkills(skills);

      if (skills.length === 0) {
        console.log("❌ No valid skills after parsing");
        setMatchingJobs([]);
        setLoading(false);
        return;
      }

      // Fetch jobs with matching skills
      console.log("🔍 Fetching jobs from database...");
      const { data: jobs, error: jobsError } = await supabase
        .from("Job_Posts")
        .select("*")
        .not("skills", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);

      console.log("🔍 Jobs query result:", { jobsCount: jobs?.length, jobsError });

      if (jobsError) {
        console.error("❌ Error fetching jobs:", jobsError);
        setMatchingJobs([]);
        setLoading(false);
        return;
      }

      if (!jobs || jobs.length === 0) {
        console.log("❌ No jobs found in database");
        setMatchingJobs([]);
        setLoading(false);
        return;
      }

      console.log("📋 All jobs with skills:", jobs.map(job => ({
        id: job.id,
        profession: job.profession,
        skills: job.skills
      })));

      // Filter jobs that match user skills
      const matchedJobs = (jobs || []).filter(job => {
        if (!job.skills || !Array.isArray(job.skills)) {
          console.log(`❌ Job ${job.id} has invalid skills:`, job.skills);
          return false;
        }
        
        const jobSkills = job.skills.map((skill: string) => skill.toLowerCase());
        const hasMatch = skills.some((userSkill: string) => 
          jobSkills.some((jobSkill: string) => 
            jobSkill.includes(userSkill) || userSkill.includes(jobSkill)
          )
        );

        console.log(`🔍 Job ${job.id} (${job.profession}):`, {
          jobSkills,
          userSkills: skills,
          hasMatch
        });

        return hasMatch;
      });

      console.log("🎯 Matched jobs:", matchedJobs.length);

      // Sort by number of matching skills (most matches first)
      matchedJobs.sort((a, b) => {
        const aMatches = getMatchingSkills(a.skills || [], skills).length;
        const bMatches = getMatchingSkills(b.skills || [], skills).length;
        return bMatches - aMatches;
      });

      const finalJobs = matchedJobs.slice(0, 6);
      console.log("✅ Final jobs to display:", finalJobs.length);
      setMatchingJobs(finalJobs);
    } catch (error) {
      console.error("💥 Error in fetchMatchingJobs:", error);
      setMatchingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchingSkills = (jobSkills: string[], userSkills: string[]): string[] => {
    const jobSkillsLower = jobSkills.map((skill: string) => skill.toLowerCase());
    return userSkills.filter((userSkill: string) =>
      jobSkillsLower.some((jobSkill: string) =>
        jobSkill.includes(userSkill) || userSkill.includes(jobSkill)
      )
    );
  };

  if (!profile || profile.user_type !== "professional") {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-blue-500" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Jobs Matching Your Skills</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matchingJobs.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-blue-500" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Jobs Matching Your Skills</h2>
        </div>
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">No matching jobs found</p>
          <p className="text-sm text-gray-500">
            {userSkills.length > 0 
              ? `Your skills: ${userSkills.join(', ')}` 
              : "Update your skills in your profile to see personalized job recommendations"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-500" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Jobs Matching Your Skills</h2>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {matchingJobs.length} match{matchingJobs.length > 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchingJobs.map((job) => {
          const matchingSkills = getMatchingSkills(job.skills || [], userSkills);
          return (
            <JobCard
              key={job.id}
              job={job}
              showMatchingSkills={matchingSkills}
              onClick={() => {
                console.log("Job clicked:", job.id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

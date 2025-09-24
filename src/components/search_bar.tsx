import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import SearchResultCard from "./SearchResultCard";

export type ProfessionalSummary = {
  user_id: string;
  name: string;
  profession: string;
  address: string | null;
  experience: number | null;
  skills: string | null;
  logo_url: string | null;
  // NEW: Enhanced fields for multi-type search
  type?: "professional" | "business" | "company";
  company_id?: string | null;
  industry?: string | null;
};

type Props = {
  initialQuery?: string;
  placeholder?: string;
  debounceMs?: number;
  limit?: number;
  className?: string;
  showResults?: boolean;
  onResults?: (profiles: ProfessionalSummary[]) => void;
  onSelectProfile?: (profile: ProfessionalSummary) => void;
  locationText?: string;
  minExperience?: number | null;
  forceSearchKey?: number | string;
  renderInput?: boolean;
  autoSearchOnChange?: boolean;
};

export default function SearchBar({
  initialQuery = "",
  placeholder = "Search professionals, businesses & companies",
  debounceMs = 400,
  limit = 20,
  className = "",
  showResults = true,
  onResults,
  onSelectProfile,
  locationText,
  minExperience,
  forceSearchKey,
  renderInput = true,
  autoSearchOnChange = true,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProfessionalSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ NEW: Session storage for maintaining state on navigation
  useEffect(() => {
    try {
      const key = `${window.location.pathname}:searchBarState`;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as { query: string; results: ProfessionalSummary[] };
        // If parent did not provide a conflicting initialQuery, restore
        if (!initialQuery || initialQuery === parsed.query) {
          setQuery(parsed.query || "");
          if (parsed.results && Array.isArray(parsed.results)) {
            setResults(parsed.results);
          }
        } else {
          setQuery(initialQuery);
        }
      } else {
        setQuery(initialQuery);
      }
    } catch {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const effectiveLimit = useMemo(() => Math.max(1, Math.min(50, limit)), [limit]);

  // ✅ ENHANCED: Multi-source search function
  const runSearch = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed === "" && !locationText && !minExperience) {
      setResults([]);
      setError(null);
      setMessage(null);
      onResults?.([]);
      
      // Clear session storage when search is empty
      try {
        const key = `${window.location.pathname}:searchBarState`;
        sessionStorage.removeItem(key);
      } catch {}
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // ✅ 1) Search Professionals from user_profiles
      let profilesQuery = supabase
        .from("user_profiles")
        .select("user_id, name, profession, address, experience, skills, logo_url")
        .limit(Math.ceil(effectiveLimit * 0.6)); // Allocate 60% to professionals

      if (trimmed) {
        profilesQuery = profilesQuery.or(
          `name.ilike.%${trimmed}%,profession.ilike.%${trimmed}%,skills.ilike.%${trimmed}%`
        );
      }
      if (locationText && locationText.trim()) {
        profilesQuery = profilesQuery.ilike("address", `%${locationText.trim()}%`);
      }
      if (typeof minExperience === "number") {
        profilesQuery = profilesQuery.gte("experience", minExperience);
      }

      // ✅ 2) Search Businesses (only if there's a text query)
      const businessesQuery = trimmed
        ? supabase
            .from("businesses")
            .select("id, business_name, logo_url, industry")
            .or(`business_name.ilike.%${trimmed}%,industry.ilike.%${trimmed}%`)
            .limit(Math.ceil(effectiveLimit * 0.2)) // Allocate 20% to businesses
        : Promise.resolve({ data: [] as any[], error: null });

      // ✅ 3) Search Companies (only if there's a text query)
      const companiesQuery = trimmed
        ? supabase
            .from("Companies")
            .select("id, name")
            .ilike("name", `%${trimmed}%`)
            .limit(Math.ceil(effectiveLimit * 0.2)) // Allocate 20% to companies
        : Promise.resolve({ data: [] as any[], error: null });

      // Execute all queries in parallel
      const [profilesRes, businessesRes, companiesRes] = await Promise.all([
        profilesQuery,
        businessesQuery,
        companiesQuery,
      ]);

      // Check for errors
      if (profilesRes.error) throw profilesRes.error;
      if ((businessesRes as any).error) throw (businessesRes as any).error;
      if ((companiesRes as any).error) throw (companiesRes as any).error;

      // ✅ Transform results to unified format
      const professionalResults = (profilesRes.data || []).map((p: any) => ({
        ...p,
        type: "professional" as const,
      }));

      const businessResults = ((businessesRes as any).data || []).map((b: any) => ({
        user_id: b.id,
        name: b.business_name,
        profession: b.industry || "Business",
        address: null,
        experience: null,
        skills: null,
        logo_url: b.logo_url || null,
        type: "business" as const,
        industry: b.industry || null,
      }));

      const companyResults = ((companiesRes as any).data || []).map((c: any) => ({
        user_id: c.id,
        name: c.name,
        profession: "Company",
        address: null,
        experience: null,
        skills: null,
        logo_url: null,
        type: "company" as const,
        company_id: c.id,
      }));

      // ✅ Merge and prioritize results (professionals first, then businesses, then companies)
      const merged: ProfessionalSummary[] = [
        ...professionalResults,
        ...businessResults,
        ...companyResults,
      ].slice(0, effectiveLimit); // Ensure we don't exceed the limit

      if (merged.length === 0 && trimmed) {
        setMessage("No results found for your search");
      } else {
        setMessage(null);
      }

      setResults(merged);
      onResults?.(merged);

      // ✅ Persist state for navigation back button
      try {
        const key = `${window.location.pathname}:searchBarState`;
        sessionStorage.setItem(key, JSON.stringify({ query: text, results: merged }));
      } catch {}

    } catch (e) {
      console.error("Search error:", e);
      setError("Unexpected error while searching");
      setResults([]);
      onResults?.([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounced search on query change
  useEffect(() => {
    if (!autoSearchOnChange) return;
    const handle = setTimeout(() => runSearch(query), debounceMs);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs, autoSearchOnChange]);

  // ✅ Clear results immediately when query becomes empty
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === "" && !locationText && !minExperience) {
      setResults([]);
      setMessage(null);
      setError(null);
      try {
        const key = `${window.location.pathname}:searchBarState`;
        sessionStorage.removeItem(key);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ✅ Force search trigger
  useEffect(() => {
    if (forceSearchKey !== undefined) {
      void runSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSearchKey]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void runSearch(query);
    }
  };

  // ✅ ENHANCED: Smart navigation based on result type
  const handleSelect = (p: ProfessionalSummary) => {
    onSelectProfile?.(p);
    if (!onSelectProfile) {
      const nameParam = encodeURIComponent(p.name);
      
      // Navigate based on result type
      if (p.type === "business") {
        // Check if business profile route exists, otherwise fallback
        navigate(`/public-business-profile/${nameParam}`);
        return;
      }
      if (p.type === "company") {
        // Check if company profile route exists, otherwise fallback
        navigate(`/public-company/${nameParam}`);
        return;
      }
      
      // Default: professional public profile
      navigate(`/public-profile/${nameParam}`);
    }
  };

  // ✅ Get result type counts for display
  const getResultsCounts = () => {
    const professionals = results.filter(r => r.type === "professional" || !r.type).length;
    const businesses = results.filter(r => r.type === "business").length;
    const companies = results.filter(r => r.type === "company").length;
    return { professionals, businesses, companies };
  };

  const counts = getResultsCounts();

  return (
    <>
      {/* ✅ Enhanced CSS for smooth horizontal scrolling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .horizontal-scroll::-webkit-scrollbar {
            height: 6px;
          }
          .horizontal-scroll::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .horizontal-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .horizontal-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          .horizontal-scroll {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
        `
      }} />

      <div className={`w-full ${className}`}>
        {renderInput && (
          <div className="flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2 border border-gray-200">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 outline-none px-2 text-sm sm:text-base"
            />
            <button
              onClick={() => runSearch(query)}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 disabled:opacity-60 text-sm font-medium transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 mt-2 px-2 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}
        
        {message && !error && (
          <div className="text-sm text-amber-700 mt-2 px-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
            {message}
          </div>
        )}

        {/* ✅ ENHANCED: Results display with type counts */}
        {showResults && results.length > 0 && (
          <div className={`${renderInput ? "mt-4" : ""}`}>
            {/* Results Header with Type Breakdown */}
            <div className="mb-3 px-1">
              <p className="text-sm text-gray-600 font-medium">
                Found {results.length} result{results.length > 1 ? 's' : ''}
                {query.trim() && ` for "${query.trim()}"`}
              </p>
              {(counts.professionals > 0 || counts.businesses > 0 || counts.companies > 0) && (
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  {counts.professionals > 0 && (
                    <span>{counts.professionals} Professional{counts.professionals > 1 ? 's' : ''}</span>
                  )}
                  {counts.businesses > 0 && (
                    <span>{counts.businesses} Business{counts.businesses > 1 ? 'es' : ''}</span>
                  )}
                  {counts.companies > 0 && (
                    <span>{counts.companies} Compan{counts.companies > 1 ? 'ies' : 'y'}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Horizontal Scrollable Cards */}
            <div className="overflow-x-auto pb-2 horizontal-scroll">
              <div className="flex gap-4 w-max px-1">
                {results.map((p) => (
                  <SearchResultCard
                    key={`${p.type || 'professional'}-${p.user_id}`}
                    profile={p}
                    onClick={() => handleSelect(p)}
                  />
                ))}
              </div>
            </div>
            
            {/* Load More Button */}
            {results.length >= effectiveLimit && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    // You can implement pagination here by increasing the limit
                    runSearch(query);
                  }}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full border border-blue-200"
                >
                  Load more results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import SearchResultCard from "./SearchResultCard"; // ✅ Added import

export type ProfessionalSummary = {
  user_id: string;
  name: string;
  profession: string;
  address: string | null;
  experience: number | null;
  skills: string | null;
  logo_url: string | null;
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
  locationText?: string; // optional additional filter on address
  minExperience?: number | null; // optional minimum experience filter
  forceSearchKey?: number | string; // change to trigger an immediate search
  renderInput?: boolean; // when false, only render results list
  autoSearchOnChange?: boolean; // when false, do not debounce on query changes
};

export default function SearchBar({
  initialQuery = "",
  placeholder = "Search professionals (e.g., Designer, Plumber, Pune)",
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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const effectiveLimit = useMemo(() => Math.max(1, Math.min(50, limit)), [limit]);

  const runSearch = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed === "" && !locationText && !minExperience) {
      setResults([]);
      setError(null);
      setMessage(null); // ✅ Clear message when empty search
      onResults?.([]);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      // Search across name, profession, skills, and address
      let queryBuilder = supabase
        .from("user_profiles")
        .select("user_id, name, profession, address, experience, skills, logo_url")
        .limit(effectiveLimit);

      if (trimmed) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${trimmed}%,profession.ilike.%${trimmed}%,skills.ilike.%${trimmed}%`
        );
      }
      if (locationText && locationText.trim()) {
        queryBuilder = queryBuilder.ilike("address", `%${locationText.trim()}%`);
      }
      if (typeof minExperience === "number") {
        queryBuilder = queryBuilder.gte("experience", minExperience);
      }

      const { data, error: sbError } = await queryBuilder;

      if (sbError) {
        setError(sbError.message);
        setResults([]);
        onResults?.([]);
        return;
      }

      const normalized = (data || []) as ProfessionalSummary[];
      if (normalized.length === 0 && trimmed) {
        setMessage("No professionals found for your search");
      }
      setResults(normalized);
      onResults?.(normalized);
    } catch (e) {
      setError("Unexpected error while searching");
      setResults([]);
      onResults?.([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoSearchOnChange) return;
    const handle = setTimeout(() => runSearch(query), debounceMs);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs, autoSearchOnChange]);

  // Trigger an immediate search when forceSearchKey changes
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

  const handleSelect = (p: ProfessionalSummary) => {
    onSelectProfile?.(p);
    if (!onSelectProfile) {
      // Default navigation to public profile by name
      const nameParam = encodeURIComponent(p.name);
      navigate(`/public-profile/${nameParam}`);
    }
  };

  return (
    <>
      {/* ✅ CSS for smooth horizontal scrolling */}
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
        `
      }} />

      <div className={`w-full ${className}`}>
        {renderInput && (
          <div className="flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2">
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

        {/* ✅ NEW: Horizontal Cards Layout */}
        {showResults && results.length > 0 && (
          <div className={`${renderInput ? "mt-4" : ""}`}>
            {/* Results Header */}
            <div className="mb-3 px-1">
              <p className="text-sm text-gray-600 font-medium">
                Found {results.length} professional{results.length > 1 ? 's' : ''}
                {query.trim() && ` for "${query.trim()}"`}
              </p>
            </div>
            
            {/* Horizontal Scrollable Cards */}
            <div className="overflow-x-auto pb-2 horizontal-scroll">
              <div className="flex gap-4 w-max px-1">
                {results.map((p) => (
                  <SearchResultCard
                    key={p.user_id}
                    profile={p}
                    onClick={() => handleSelect(p)}
                  />
                ))}
              </div>
            </div>
            
            {/* Show More Button (if at limit) */}
            {results.length >= effectiveLimit && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => {
                    // Increase limit and search again (you can modify this logic)
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

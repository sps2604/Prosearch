import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
// import removed: using card route auto-download

interface CompanyRow {
  id: string;
  name: string;
  email?: string;
  contact?: string;
  website?: string;
  location?: string;
  logo_url?: string;
  description?: string;
}

export default function PublicCompanyProfile() {
  const { name } = useParams<{ name: string }>();
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      if (!name) {
        setError("Company name missing");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("Companies")
          .select("*")
          .ilike("name", decodeURIComponent(name))
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        setCompany(data ?? null);
        if (!data) setError("Company not found");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch company");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [name]);

  if (loading) return <div className="p-6 text-center">Loading company…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!company) return <div className="p-6 text-center">Company not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div ref={headerRef} className="flex items-center gap-4 mb-4">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl">
              {company.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            {company.location && <p className="text-gray-600">{company.location}</p>}
          </div>
        </div>
        {company.description && (
          <p className="text-gray-800 mb-4 whitespace-pre-wrap">{company.description}</p>
        )}
        <div className="space-y-1 text-sm text-gray-700">
          {company.email && <p>Email: {company.email}</p>}
          {company.contact && <p>Phone: {company.contact}</p>}
          {company.website && (
            <p>
              Website: <a className="text-blue-600 hover:underline" href={company.website} target="_blank" rel="noreferrer">{company.website}</a>
            </p>
          )}
        </div>
        <div className="mt-3 text-center">
          <a
            href={`/public-company-card/${encodeURIComponent(company.name)}?download=1`}
            className="text-sm text-blue-600 hover:underline"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}


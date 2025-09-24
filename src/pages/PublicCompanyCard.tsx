import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { supabase } from "../lib/supabaseClient";

interface CompanyRow {
  id: string;
  name: string;
  logo_url?: string | null;
  location?: string | null;
  description?: string | null;
  email?: string | null;
  contact?: string | null;
  website?: string | null;
}

export default function PublicCompanyCard() {
  const { name } = useParams<{ name: string }>();
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      if (!name) { setError("Company name missing"); setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from("Companies")
          .select("*")
          .ilike("name", decodeURIComponent(name))
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

  const downloadPng = async () => {
    if (!ref.current || !company) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 3 });
    const link = document.createElement("a");
    link.download = `${company.name.replace(/\s+/g, "_")}-card.png`;
    link.href = dataUrl;
    link.click();
  };

  // Auto-download when ?download=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('download') === '1' && company) {
      setTimeout(() => { downloadPng(); }, 300);
    }
  }, [company]);

  if (loading) return <div className="p-6 text-center">Loading card…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!company) return <div className="p-6 text-center">Company not found</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <div ref={ref} className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-center">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white text-orange-600 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              {company.name?.[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold">{company.name}</h1>
          {company.location && <p className="opacity-90">{company.location}</p>}
        </div>
        <div className="p-6 text-sm text-gray-800">
          {company.description && <p className="mb-3">{company.description}</p>}
          {company.contact && <p>Phone: {company.contact}</p>}
          {company.email && <p>Email: {company.email}</p>}
          {company.website && (
            <p>
              Website: <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{company.website}</a>
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 text-center">
        <button onClick={downloadPng} className="text-blue-600 text-sm hover:underline">Download PNG</button>
      </div>
    </div>
  );
}



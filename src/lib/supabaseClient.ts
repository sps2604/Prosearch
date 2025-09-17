import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

supabase.auth.onAuthStateChange(async (_event, _session) => {
  // Removed profile creation logic from here. Profile creation should occur
  // in create-profile.tsx and CreateBusinessProfile.tsx after user selects type.
  // This listener should primarily manage auth state.
});

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local",
  );
}

// createClient throws on an empty URL, which blanks the whole site. Fall back to
// a dead placeholder so requests fail softly and CMS fallbacks render instead.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "missing-anon-key",
);

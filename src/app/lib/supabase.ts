import { createClient } from "@supabase/supabase-js";

// Public (anon) credentials; row-level security on the tables decides what
// the browser may read or write. Unset in local dev → features fall back.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

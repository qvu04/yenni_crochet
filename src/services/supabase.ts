import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env");
}

let supabaseAccessToken: string | null = null;

export const setSupabaseAccessToken = (accessToken: string | null) => {
  supabaseAccessToken = accessToken;
};

export const clearSupabaseAccessToken = () => {
  supabaseAccessToken = null;
};

// The anon key is intentionally public. Personal RPCs additionally receive a
// short-lived verified Zalo JWT through accessToken, so Postgres can enforce
// auth.jwt()->>'zalo_user_id' without exposing a service key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => supabaseAccessToken,
});

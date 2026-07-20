import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env");
}

// anon key an toàn để nằm trong frontend — RLS (supabase/rls.sql) mới là lớp
// chặn thật sự, không phải việc giấu key này
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

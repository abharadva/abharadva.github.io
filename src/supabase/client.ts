import { createClient, Session, User, SupabaseClientOptions } from "@supabase/supabase-js";
import { config } from "@/lib/config";

const { supabase: supabaseConfig } = config;

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  throw new Error("Supabase URL and Anon Key must be configured in environment variables.");
}

const options: SupabaseClientOptions<"public"> = {};

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  options,
);

export type { Session, User };
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  configuredUrl
  && configuredKey
  && !configuredUrl.includes("<project_url>")
  && !configuredKey.includes("<publishable_key>"),
);

// Valid placeholders keep local builds renderable until .env.local is filled in.
const supabaseUrl = isSupabaseConfigured ? configuredUrl! : "https://placeholder.supabase.co";
const supabaseKey = isSupabaseConfigured ? configuredKey! : "placeholder-publishable-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

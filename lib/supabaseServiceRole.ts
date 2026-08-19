/**
 * Server-only Supabase client that uses the SERVICE ROLE key.
 * NEVER import this in a "use client" component — it bypasses ALL Row-Level
 * Security and must only ever run in server contexts (Route Handlers, etc.).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (NOT prefixed with
 * NEXT_PUBLIC_ — it must remain server-only).
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

// Use placeholder values at build time; the route handler will fail at
// request time with a clear error if the env var is missing.
const resolvedUrl = supabaseUrl || "https://placeholder.supabase.co";
const resolvedKey = serviceRoleKey || "placeholder-service-role-key";

export const supabaseAdmin = createClient<Database>(resolvedUrl, resolvedKey, {
  auth: {
    // Disable automatic token refresh and session persistence — this is a
    // server-only admin client that should never touch browser storage.
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${resolvedKey}`,
    },
  },
});

/** Call this inside route handlers to guard against missing env vars at runtime. */
export function assertServiceRoleConfigured() {
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === "placeholder-service-role-key") {
    throw new Error(
      "[supabaseServiceRole] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. " +
      "Add it before using staff management features."
    );
  }
}

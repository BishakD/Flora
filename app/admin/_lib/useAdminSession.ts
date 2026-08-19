"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Runs a session check on mount:
 *  - No session            → /admin/login
 *  - Role is 'reception'   → /reception  (has a portal but not admin)
 *  - Role is 'admin'       → allowed
 *  - No staff row / error  → allowed (graceful fallback — staff table may not
 *                            be set up yet, or this is the bootstrapping admin)
 *
 * Call this at the top of every admin page component.
 */
export function useAdminSession() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      // Check role in the staff table.
      // If the table doesn't exist yet, or this user has no row yet,
      // we allow access — the session itself is the auth gate for /admin.
      const { data: staffRow, error } = await supabase
        .from("staff")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // If there's a DB error (table missing, network, etc.) or no row —
      // fall through and allow access. Don't sign the user out.
      if (error || !staffRow) {
        return;
      }

      // Only redirect if the role is explicitly 'reception'
      if (staffRow.role === "reception") {
        router.replace("/reception");
      }

      // role === 'admin' (or any future role) → allowed, do nothing
    }

    checkSession();
  }, [router]);
}

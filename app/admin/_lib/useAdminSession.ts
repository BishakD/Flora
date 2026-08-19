"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Runs a session check on mount and redirects appropriately:
 *  - No session            → /admin/login
 *  - Role is 'reception'   → /reception  (has a portal but not admin)
 *  - No staff row          → /admin/login (not a staff member)
 *  - Role is 'admin'       → allowed, no redirect
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

      // Check role in the staff table
      const { data: staffRow, error } = await supabase
        .from("staff")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !staffRow) {
        // User has a Supabase Auth session but is not in the staff table
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (staffRow.role === "reception") {
        // Reception staff should use the reception portal
        router.replace("/reception");
        return;
      }

      // role === 'admin' → allowed, do nothing
    }

    checkSession();
  }, [router]);
}

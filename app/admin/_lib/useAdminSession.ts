"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Guards every /admin/* page. Uses onAuthStateChange so we wait for Supabase
 * to fully restore the session from localStorage before deciding — this avoids
 * false "no session" redirects that happen when getSession() is called too
 * early on component mount (especially during client-side navigation).
 *
 * Behaviour:
 *  - INITIAL_SESSION / SIGNED_IN with no session → /admin/login
 *  - Role is 'reception'                         → /reception
 *  - Role is 'admin' OR no staff row yet         → allowed
 *  - SIGNED_OUT                                  → /admin/login
 */
export function useAdminSession() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only act on the initial resolution and explicit sign-in/out events
        if (event === "SIGNED_OUT") {
          router.replace("/admin/login");
          return;
        }

        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (!session) {
            router.replace("/admin/login");
            return;
          }

          // Check role — graceful: if table missing or no row, allow through
          const { data: staffRow } = await supabase
            .from("staff")
            .select("role")
            .eq("id", session.user.id)
            .single();

          // Only redirect if there is an explicit 'reception' role
          if (staffRow?.role === "reception") {
            router.replace("/reception");
          }
          // 'admin' or no row → allowed
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);
}

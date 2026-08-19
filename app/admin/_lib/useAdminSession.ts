"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Guards every /admin/* page. Uses onAuthStateChange so we wait for Supabase
 * to fully restore the session from localStorage before deciding.
 *
 * This hook ONLY checks whether a Supabase session exists. It does NOT query
 * the staff table — role checking is done server-side by the API routes.
 *
 * Behaviour:
 *  - INITIAL_SESSION / SIGNED_IN with no session → /admin/login
 *  - SIGNED_OUT                                  → /admin/login
 *  - Has session                                 → allowed through
 */
export function useAdminSession() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.replace("/admin/login");
          return;
        }

        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (!session) {
            router.replace("/admin/login");
            return;
          }
          // Session exists — allow through. Role verification happens
          // server-side in the API routes, not here.
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);
}

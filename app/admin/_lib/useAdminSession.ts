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
export function useAdminSession(allowedRoles: string[] = ["admin"], redirectUrl: string = "/admin/login") {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          router.replace(redirectUrl);
          return;
        }

        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (!session) {
            router.replace(redirectUrl);
            return;
          }
          
          if (allowedRoles && allowedRoles.length > 0) {
            try {
              const res = await fetch("/api/staff/me", {
                headers: { Authorization: `Bearer ${session.access_token}` },
              });
              const json = await res.json();
              
              if (!res.ok || !json.role || !allowedRoles.includes(json.role)) {
                console.warn("[useAdminSession] Role not allowed or error:", json);
                // If they are reception and trying to access admin, send them to reception
                if (json.role === "reception" && redirectUrl === "/admin/login") {
                   router.replace("/reception");
                } else {
                   router.replace(redirectUrl);
                }
              }
            } catch (err) {
              console.error("[useAdminSession] Error checking role:", err);
              router.replace(redirectUrl);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, allowedRoles, redirectUrl]);
}

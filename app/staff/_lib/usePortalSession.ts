"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Guards portal pages. Waits for Supabase to restore the session, then
 * verifies the user has a staff role via /api/staff/me.
 *
 * Unlike useAdminSession, this accepts ANY valid staff role.
 * Returns the role string so the lobby can render tiles accordingly.
 */
export function usePortalSession(redirectUrl: string = "/staff/login") {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace(redirectUrl);
        return;
      }

      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        if (!session) {
          router.replace(redirectUrl);
          return;
        }

        try {
          const res = await fetch("/api/staff/me", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const json = await res.json();

          if (!res.ok || !json.role) {
            console.warn("[usePortalSession] No valid staff role:", json);
            router.replace(redirectUrl);
            return;
          }

          setRole(json.role);
        } catch (err) {
          console.error("[usePortalSession] Error checking role:", err);
          router.replace(redirectUrl);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, redirectUrl]);

  return { role, loading };
}

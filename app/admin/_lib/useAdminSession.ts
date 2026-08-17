"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Runs a session check on mount and redirects to /admin/login if no active
 * Supabase session exists. Call this at the top of every admin page component.
 */
export function useAdminSession() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/admin/login");
    });
  }, [router]);
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy admin login — redirects to the unified staff portal.
 */
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/staff/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-flora-cream">
      <p className="font-sans text-sm text-flora-grey">
        Redirecting to Staff Portal…
      </p>
    </main>
  );
}

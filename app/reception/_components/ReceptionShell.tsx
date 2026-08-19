"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ReceptionShellProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for the /reception page:
 *  - Sticky top bar with wordmark, page title, and log-out button
 *  - Main content area
 */
export function ReceptionShell({
  title,
  eyebrow = "Flora · Firenze",
  children,
}: ReceptionShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/staff/login");
  }

  return (
    <div className="min-h-screen bg-flora-cream pt-[var(--nav-height)]">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-[var(--nav-height)] z-10 border-b border-flora-line bg-flora-ivory/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          {/* Row 1: wordmark + log-out */}
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="eyebrow text-flora-gold">{eyebrow}</p>
              <h1 className="display-title text-[1.45rem] text-flora-navy leading-tight">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/staff"
                className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-flora-grey hover:text-flora-navy transition-colors"
              >
                ← Portal
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="luxury-button border-flora-line text-flora-grey hover:border-flora-navy [--button-fill:var(--flora-navy)] [--button-ink:var(--flora-ivory-card)]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main
        id="main-content"
        className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
  );
}

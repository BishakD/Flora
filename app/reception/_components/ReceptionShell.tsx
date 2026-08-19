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
        <div className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8">
          {/* Row 1: wordmark + buttons */}
          <div className="flex items-center justify-between gap-2 py-2.5 sm:py-4">
            <div className="min-w-0 flex-1 pr-1 sm:pr-4">
              <p className="eyebrow text-flora-gold text-[0.55rem] sm:text-[0.66rem] truncate">
                {eyebrow}
              </p>
              <h1 className="display-title text-[1.15rem] sm:text-[1.45rem] text-flora-navy leading-tight truncate">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Link
                href="/staff"
                className="luxury-button border-flora-line text-flora-grey hover:border-flora-navy [--button-fill:var(--flora-navy)] [--button-ink:var(--flora-ivory-card)] inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[0.56rem] sm:text-[0.62rem] whitespace-nowrap min-h-0"
              >
                <span className="text-[0.7rem] sm:text-xs leading-none">←</span>
                <span>Portal</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="luxury-button border-flora-line text-flora-grey hover:border-flora-navy [--button-fill:var(--flora-navy)] [--button-ink:var(--flora-ivory-card)] inline-flex items-center px-2.5 py-1.5 sm:px-4 sm:py-2 text-[0.56rem] sm:text-[0.62rem] whitespace-nowrap min-h-0"
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

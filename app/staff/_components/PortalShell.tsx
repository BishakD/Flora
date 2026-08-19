"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface PortalShellProps {
  /** Page heading shown in the top bar */
  title: string;
  /** Optional eyebrow above the heading */
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for portal pages (the Lobby).
 * Minimal layout with wordmark, title, and log-out button.
 */
export function PortalShell({
  title,
  eyebrow = "Flora · Firenze",
  children,
}: PortalShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/staff/login");
  }

  return (
    <div className="min-h-screen bg-flora-cream pt-[var(--nav-height)]">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="sticky top-[var(--nav-height)] z-10 border-b border-flora-line bg-flora-ivory/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="eyebrow text-flora-gold">{eyebrow}</p>
              <h1 className="display-title text-[1.45rem] text-flora-navy leading-tight">
                {title}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="luxury-button border-flora-line text-flora-grey hover:border-flora-navy [--button-fill:var(--flora-navy)] [--button-ink:var(--flora-ivory-card)]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main
        id="main-content"
        className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6"
      >
        {children}
      </main>
    </div>
  );
}

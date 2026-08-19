"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/admin",            label: "Bookings"   },
  { href: "/admin/room-types", label: "Room Types" },
  { href: "/admin/rate-plans", label: "Rate Plans" },
  { href: "/admin/staff",      label: "Staff"      },
] as const;

interface AdminShellProps {
  /** Page heading shown in the top bar */
  title: string;
  /** Optional eyebrow above the heading */
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for every /admin/* page:
 *  - Sticky top bar with wordmark, page title, and log-out button
 *  - Horizontal nav linking to Bookings / Room Types / Rate Plans
 *  - Main content area
 */
export function AdminShell({ title, eyebrow = "Flora · Firenze", children }: AdminShellProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  // Active-link matcher — exact match for /admin, prefix match for sub-routes
  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-flora-cream pt-[var(--nav-height)]">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-[var(--nav-height)] z-10 border-b border-flora-line bg-flora-ivory/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] px-6">
          {/* Row 1: wordmark + log-out */}
          <div className="flex items-center justify-between gap-4 py-3">
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

          {/* Row 2: section nav */}
          <nav
            aria-label="Admin navigation"
            className="flex gap-1 pb-0"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em] transition-colors duration-150
                    ${active
                      ? "text-flora-navy after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-flora-gold"
                      : "text-flora-grey hover:text-flora-navy"
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main id="main-content" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}

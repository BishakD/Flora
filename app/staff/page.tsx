"use client";

import Link from "next/link";
import { usePortalSession } from "@/app/staff/_lib/usePortalSession";
import { PortalShell } from "@/app/staff/_components/PortalShell";

// ─── Department Tile Definitions ──────────────────────────────────────────────

interface DepartmentTile {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  /** Which roles can see this tile */
  roles: string[];
  /** Accent colour for the icon background */
  accent: string;
  accentBorder: string;
}

const DEPARTMENTS: DepartmentTile[] = [
  {
    id: "reception",
    label: "Reception",
    description:
      "Front desk operations — today's arrivals, departures, and all active bookings.",
    href: "/reception",
    roles: ["admin", "reception"],
    accent: "bg-flora-sage/20",
    accentBorder: "border-flora-sage",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-flora-navy"
      >
        <path d="M2 20v-1a4 4 0 0 1 4-4h2" />
        <path d="M6 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
        <path d="M22 20v-1a4 4 0 0 0-4-4h-2" />
        <path d="M18 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M12 14v6" />
        <path d="M9 20h6" />
      </svg>
    ),
  },
  {
    id: "admin",
    label: "Administration",
    description:
      "Full management — bookings, room types, rate plans, and staff accounts.",
    href: "/admin",
    roles: ["admin"],
    accent: "bg-flora-navy/10",
    accentBorder: "border-flora-navy/30",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-flora-navy"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

// ─── Lobby Page ───────────────────────────────────────────────────────────────

export default function PortalLobbyPage() {
  const { role, loading } = usePortalSession();

  if (loading || !role) {
    return (
      <PortalShell title="Staff Portal">
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-flora-navy/20 border-t-flora-navy" />
        </div>
      </PortalShell>
    );
  }

  const visibleTiles = DEPARTMENTS.filter((d) => d.roles.includes(role));

  return (
    <PortalShell title="Staff Portal">
      {/* Greeting */}
      <div className="mb-8">
        <p className="font-sans text-[0.82rem] text-flora-grey leading-relaxed">
          Welcome back. Select a department to get started.
        </p>
      </div>

      {/* Department Tiles */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTiles.map((dept) => (
          <Link
            key={dept.id}
            href={dept.href}
            className="group relative flex flex-col rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-soft transition-all duration-200 hover:border-flora-gold hover:shadow-lift"
          >
            {/* Icon */}
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg border ${dept.accent} ${dept.accentBorder} transition-colors duration-200 group-hover:bg-flora-gold/10 group-hover:border-flora-gold/40`}
            >
              {dept.icon}
            </div>

            {/* Label */}
            <h2 className="font-display text-[1.15rem] text-flora-navy leading-tight">
              {dept.label}
            </h2>

            {/* Description */}
            <p className="mt-2 font-sans text-[0.78rem] text-flora-grey leading-relaxed">
              {dept.description}
            </p>

            {/* Arrow indicator */}
            <div className="mt-auto flex items-center pt-5">
              <span className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.14em] text-flora-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Open
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 text-flora-gold opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}

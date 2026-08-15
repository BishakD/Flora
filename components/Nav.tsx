"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["The Palace", "/#palace"],
  ["Rooms & Suites", "/#rooms"],
  ["Dining", "/dining"],
  ["Spa", "/spa"],
  ["Contacts", "/#contact"],
] as const;

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 42);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] h-[var(--nav-height)] border-b transition-all duration-300 ${
        scrolled || open
          ? "border-flora-line/70 bg-flora-cream/95 shadow-[0_8px_30px_rgba(43,32,22,0.06)] backdrop-blur-md"
          : "border-transparent bg-flora-cream/88 backdrop-blur-[2px]"
      }`}
    >
      <nav aria-label="Primary navigation" className="mx-auto flex h-full w-[min(100%-28px,1440px)] items-center justify-between gap-6">
        <Link href="/" className="group flex shrink-0 items-baseline gap-2" aria-label="Flora home">
          <span className="font-display text-[1.35rem] tracking-[0.22em] text-flora-slate">FLORA</span>
          <span className="hidden font-sans text-[0.49rem] uppercase tracking-[0.2em] text-flora-grey xl:inline">Firenze</span>
        </Link>

        <div className="hidden items-center gap-[clamp(1rem,2vw,2.15rem)] lg:flex">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="nav-link font-sans text-[0.62rem] font-medium uppercase tracking-[0.15em] text-flora-charcoal">
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <button type="button" className="font-sans text-[0.58rem] uppercase tracking-[0.14em] text-flora-grey" aria-label="Language selector, English selected">
            ITA <span aria-hidden="true">/</span> <span className="border-b border-flora-charcoal pb-1 text-flora-charcoal">ENG</span>
          </button>
          <Link
            href="/booking"
            className="luxury-button border-flora-blue bg-flora-blue text-flora-ivory [--button-fill:var(--flora-slate-blue-deep)]"
          >
            Book now
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/booking" className="rounded-full bg-flora-blue px-4 py-2 font-sans text-[0.58rem] uppercase tracking-[0.13em] text-flora-ivory">
            Book
          </Link>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-flora-line text-flora-charcoal"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-1 h-px w-5 bg-current transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`absolute bottom-1 left-0 h-px w-5 bg-current transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`fixed inset-x-0 top-[var(--nav-height)] overflow-hidden border-b border-flora-line bg-flora-cream transition-[max-height,opacity] duration-500 ease-luxury lg:hidden ${
          open ? "max-h-[calc(100svh-var(--nav-height))] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="botanical flex min-h-[calc(100svh-var(--nav-height))] flex-col px-7 py-10">
          <div className="flex flex-col">
            {links.map(([label, href], index) => (
              <Link key={label} href={href} className="border-b border-flora-line py-4 font-display text-[clamp(1.7rem,8vw,2.6rem)] leading-none">
                <span className="mr-3 align-middle font-sans text-[0.55rem] tracking-[0.18em] text-flora-grey">0{index + 1}</span>
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-4 pt-12">
            <p className="max-w-[220px] font-body text-base leading-relaxed text-flora-grey">A boutique palazzo concept in Florence, Italy.</p>
            <span className="font-script text-4xl text-flora-gold">Firenze</span>
          </div>
        </div>
      </div>
    </header>
  );
}

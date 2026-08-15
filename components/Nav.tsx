"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const leftLinks = [
  ["The Palace", "/#palace"],
  ["Rooms & Suites", "/#rooms"],
  ["Dining", "/#dining"],
  ["Spa", "/#spa"],
] as const;

const mobileLinks = [...leftLinks, ["Contacts", "/#contact"]] as const;

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-[70] h-[var(--nav-height)] border-b bg-flora-cream transition-shadow duration-300 ${scrolled || open ? "border-flora-line/70 shadow-[0_8px_24px_rgba(43,32,22,.055)]" : "border-flora-line/45"}`}>
      <nav aria-label="Primary navigation" className="mx-auto grid h-full w-[min(100%-32px,1216px)] grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="hidden items-center gap-[clamp(1.15rem,2.25vw,2.7rem)] lg:flex">
          {leftLinks.map(([label, href]) => <Link key={label} href={href} className="nav-link whitespace-nowrap font-sans text-[0.58rem] font-medium uppercase tracking-[0.14em] text-flora-charcoal">{label}</Link>)}
        </div>

        <Link href="/" className="col-start-1 flex flex-col items-start justify-center leading-none lg:col-start-2 lg:items-center" aria-label="Flora home">
          <span className="font-display text-[1.25rem] tracking-[0.08em] text-flora-blue lg:text-[1.32rem]">FLORA</span>
          <span className="mt-0.5 hidden font-sans text-[0.34rem] uppercase tracking-[0.32em] text-flora-grey lg:block">Firenze</span>
        </Link>

        <div className="col-start-3 row-start-1 flex items-center justify-end gap-[clamp(.8rem,1.7vw,1.75rem)]">
          <Link href="/#contact" className="nav-link hidden whitespace-nowrap font-sans text-[0.58rem] font-medium uppercase tracking-[0.14em] lg:block">Contacts</Link>
          <button type="button" className="hidden whitespace-nowrap font-sans text-[0.55rem] uppercase tracking-[0.13em] text-flora-grey lg:block" aria-label="Language selector, English selected">ITA <span aria-hidden="true">/</span> <span className="border-b border-flora-charcoal pb-1 text-flora-charcoal">ENG</span></button>
          <Link href="/booking" className="notched-button hidden min-w-[132px] bg-flora-blue px-6 py-3 text-center font-sans text-[0.58rem] uppercase tracking-[0.14em] text-flora-ivory lg:block">Book now</Link>
          <Link href="/booking" className="rounded-full bg-flora-blue px-4 py-2 font-sans text-[0.55rem] uppercase tracking-[0.13em] text-flora-ivory lg:hidden">Book</Link>
          <button type="button" className="flex size-10 items-center justify-center rounded-full border border-flora-line text-flora-charcoal lg:hidden" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-1 h-px w-5 bg-current transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`absolute bottom-1 left-0 h-px w-5 bg-current transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      <div id="mobile-navigation" className={`fixed inset-x-0 top-[var(--nav-height)] overflow-hidden border-b border-flora-line bg-flora-cream transition-[max-height,opacity] duration-500 ease-luxury lg:hidden ${open ? "max-h-[calc(100svh-var(--nav-height))] opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}>
        <div className="botanical flex min-h-[calc(100svh-var(--nav-height))] flex-col px-7 py-9">
          <div className="flex flex-col">
            {mobileLinks.map(([label, href], index) => (
              <Link key={label} href={href} onClick={() => setOpen(false)} className="border-b border-flora-line py-4 font-display text-[clamp(1.7rem,8vw,2.55rem)] leading-none"><span className="mr-3 align-middle font-sans text-[0.5rem] tracking-[0.18em] text-flora-grey">0{index + 1}</span>{label}</Link>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-4 pt-10">
            <p className="max-w-[210px] text-base leading-relaxed text-flora-grey">A private palazzo rhythm in the heart of Florence.</p>
            <span className="font-script text-4xl text-flora-gold">Firenze</span>
          </div>
        </div>
      </div>
    </header>
  );
}

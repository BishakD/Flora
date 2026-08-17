"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function isoDate(offsetDays: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-5 py-2">
      <span className="font-sans text-[0.62rem] uppercase tracking-[0.14em]">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" className="size-9 rounded-full border border-flora-line text-lg" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Decrease ${label}`}>
          −
        </button>
        <output className="w-4 text-center font-sans text-xs" aria-live="polite">{value}</output>
        <button type="button" className="size-9 rounded-full border border-flora-line text-lg" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export function BookingBar({ compact = false, cartCount = 0, roomSlug }: { compact?: boolean; cartCount?: number; roomSlug?: string }) {
  const router = useRouter();
  const popover = useRef<HTMLDivElement>(null);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [ages, setAges] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState(isoDate(21));
  const [checkOut, setCheckOut] = useState(isoDate(23));
  const [error, setError] = useState("");
  const tomorrow = useMemo(() => isoDate(1), []);

  useEffect(() => {
    setAges((previous) => Array.from({ length: children }, (_, index) => previous[index] ?? ""));
  }, [children]);

  useEffect(() => {
    if (!guestsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) setGuestsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGuestsOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [guestsOpen]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (children > 0 && ages.some((age) => !age)) {
      setError("Please select an age for each child.");
      setGuestsOpen(true);
      return;
    }
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }
    setError("");
    const params = new URLSearchParams({ adults: String(adults), children: String(children), checkIn, checkOut });
    if (roomSlug) params.set("room", roomSlug);
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`relative mx-auto grid w-full items-stretch border border-flora-line bg-flora-ivory shadow-soft ${
        compact
          ? "grid-cols-1 rounded-2xl sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_auto]"
          : "grid-cols-2 rounded-2xl md:grid-cols-[1.15fr_1fr_1fr_1fr_auto] md:rounded-full"
      }`}
      aria-label="Check availability"
    >
      <div ref={popover} className="relative border-b border-r border-flora-line md:border-b-0">
        <button type="button" className="flex h-full min-h-[68px] w-full flex-col items-start justify-center px-5 text-left" onClick={() => setGuestsOpen((value) => !value)} aria-expanded={guestsOpen}>
          <span className="eyebrow text-[0.54rem] text-flora-grey">Guests</span>
          <span className="mt-1 text-base leading-none">{adults} adults{children ? ` · ${children} children` : ""}</span>
        </button>
        {guestsOpen ? (
          <div className="absolute left-0 top-[calc(100%+10px)] z-30 w-[min(340px,calc(100vw-36px))] rounded-2xl border border-flora-line bg-flora-ivory p-5 text-flora-charcoal shadow-lift">
            <Stepper label="Adults" value={adults} min={1} max={4} onChange={setAdults} />
            <Stepper label="Children" value={children} min={0} max={3} onChange={setChildren} />
            {children > 0 ? (
              <div className="mt-3 space-y-3 border-t border-flora-line pt-4">
                <p className="eyebrow text-[0.52rem] text-flora-grey">Child ages</p>
                {ages.map((age, index) => (
                  <label key={index} className="flex items-center justify-between gap-4 font-sans text-[0.65rem] uppercase tracking-[0.1em]">
                    Child {index + 1}
                    <select
                      value={age}
                      onChange={(event) => setAges((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                      className="rounded-full border border-flora-line bg-flora-cream px-3 py-2"
                      aria-label={`Age of child ${index + 1}`}
                    >
                      <option value="">Age</option>
                      {Array.from({ length: 18 }, (_, ageValue) => <option key={ageValue} value={ageValue}>{ageValue}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            ) : null}
            {error ? <p className="mt-3 text-sm text-flora-terracotta" role="alert">{error}</p> : null}
          </div>
        ) : null}
      </div>

      <label className="flex min-h-[68px] flex-col justify-center border-b border-flora-line px-5 md:border-b-0 md:border-r">
        <span className="eyebrow text-[0.54rem] text-flora-grey">Check-in</span>
        <input type="date" min={tomorrow} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1 min-w-0 bg-transparent text-sm outline-none" aria-label="Check-in date" />
      </label>
      <label className="flex min-h-[68px] flex-col justify-center border-r border-flora-line px-5">
        <span className="eyebrow text-[0.54rem] text-flora-grey">Check-out</span>
        <input type="date" min={checkIn || tomorrow} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1 min-w-0 bg-transparent text-sm outline-none" aria-label="Check-out date" />
      </label>
      <div className="hidden min-h-[68px] flex-col justify-center border-r border-flora-line px-5 md:flex">
        <span className="eyebrow text-[0.54rem] text-flora-grey">Your cart</span>
        <span className="mt-1 text-sm">{cartCount} {cartCount === 1 ? "item" : "items"}</span>
      </div>
      <button type="submit" className="m-2 min-h-[52px] rounded-full bg-flora-blue px-6 font-sans text-[0.62rem] font-medium uppercase tracking-[0.15em] text-flora-ivory transition-colors hover:bg-flora-slate">
        Check availability
      </button>
      {error && !guestsOpen ? <p className="col-span-full px-5 pb-3 text-sm text-flora-terracotta" role="alert">{error}</p> : null}
    </form>
  );
}

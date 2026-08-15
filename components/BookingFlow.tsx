"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { Room, RoomRate } from "@/data/rooms";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { BookingCreate } from "@/types/database";

type DateValue = Date | null;

type Selection = {
  room: Room;
  rate: RoomRate;
};

type Confirmation = {
  guestName: string;
  roomName: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  currency: string;
};

function atNoon(date: Date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  return result;
}

function fromIso(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: DateValue) {
  return date ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date) : "Select date";
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1, 12);
}

function calendarNights(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(1, Math.round((endUtc - startUtc) / 86_400_000));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CalendarMonth({ month, start, end, invalidDate, onSelect }: { month: Date; start: DateValue; end: DateValue; invalidDate: string; onSelect: (date: Date) => void }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: leading + days }, (_, index) => (index < leading ? null : new Date(year, monthIndex, index - leading + 1, 12)));

  function keyMove(event: React.KeyboardEvent<HTMLButtonElement>, date: Date) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const target = new Date(date);
    target.setDate(target.getDate() + offset);
    document.querySelector<HTMLButtonElement>(`[data-calendar-date="${toIso(target)}"]`)?.focus();
  }

  return (
    <section aria-label={new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month)}>
      <h3 className="text-center font-display text-2xl">{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month)}</h3>
      <div className="mt-5 grid grid-cols-7 gap-1 text-center font-sans text-[0.5rem] uppercase tracking-[0.08em] text-flora-grey">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => <span key={day} className="py-1">{day}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} aria-hidden="true" className="aspect-square" />;
          const iso = toIso(date);
          const past = date < atNoon(new Date());
          const selectedStart = start && toIso(start) === iso;
          const selectedEnd = end && toIso(end) === iso;
          const inRange = start && end && date > start && date < end;
          const invalid = invalidDate === iso;
          return (
            <button
              key={iso}
              type="button"
              data-calendar-date={iso}
              disabled={past}
              onClick={() => onSelect(date)}
              onKeyDown={(event) => keyMove(event, date)}
              className={`relative aspect-square rounded-full font-sans text-[0.65rem] transition-colors ${
                past ? "unavailable-day cursor-not-allowed rounded-md" : selectedStart || selectedEnd ? "bg-flora-slate text-flora-ivory" : inRange ? "bg-flora-blue/25 text-flora-slate" : "hover:bg-flora-blush"
              }`}
              aria-label={`${new Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(date)}${past ? ", unavailable" : ""}`}
              aria-invalid={invalid || undefined}
              aria-pressed={Boolean(selectedStart || selectedEnd)}
            >
              {date.getDate()}
              {invalid ? <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-flora-terracotta" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function Calendar({ start, end, onChange, invalidDate = "" }: { start: DateValue; end: DateValue; onChange: (start: DateValue, end: DateValue) => void; invalidDate?: string }) {
  const initialMonth = start ? new Date(start.getFullYear(), start.getMonth(), 1, 12) : new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);
  const [month, setMonth] = useState(initialMonth);

  function select(date: Date) {
    if (!start || end || date <= start) onChange(date, null);
    else onChange(start, date);
  }

  return (
    <div className="border border-flora-line bg-flora-ivory p-5 shadow-soft sm:p-7" aria-label="Stay dates calendar">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" className="grid size-10 place-items-center rounded-full border border-flora-line" onClick={() => setMonth((current) => addMonths(current, -1))} aria-label="Previous month">←</button>
        <p className="eyebrow text-flora-grey">Select arrival and departure</p>
        <button type="button" className="grid size-10 place-items-center rounded-full border border-flora-line" onClick={() => setMonth((current) => addMonths(current, 1))} aria-label="Next month">→</button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <CalendarMonth month={month} start={start} end={end} invalidDate={invalidDate} onSelect={select} />
        <CalendarMonth month={addMonths(month, 1)} start={start} end={end} invalidDate={invalidDate} onSelect={select} />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-flora-line pt-5 font-sans text-[0.54rem] uppercase tracking-[0.08em] text-flora-grey">
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-flora-slate" /> Selected</span>
        <span className="flex items-center gap-2"><span className="unavailable-day size-3 rounded-sm border border-flora-line" /> Past date</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-flora-terracotta" /> Invalid choice</span>
      </div>
    </div>
  );
}

function GuestStepper({ label, value, min, max, setValue }: { label: string; value: number; min: number; max: number; setValue: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-flora-line py-3">
      <span className="eyebrow text-flora-grey">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" className="size-9 rounded-full border border-flora-line" onClick={() => setValue(Math.max(min, value - 1))} aria-label={`Decrease ${label}`}>−</button>
        <output className="w-4 text-center font-sans text-xs">{value}</output>
        <button type="button" className="size-9 rounded-full border border-flora-line" onClick={() => setValue(Math.min(max, value + 1))} aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

type BookingFlowProps = {
  rooms: Room[];
  initialAdults?: number;
  initialChildren?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRoom?: string;
  initialRate?: string;
};

export function BookingFlow({ rooms, initialAdults = 2, initialChildren = 0, initialCheckIn, initialCheckOut, initialRoom, initialRate }: BookingFlowProps) {
  const safeInitialAdults = Math.min(Math.max(initialAdults, 1), 4);
  const safeInitialChildren = Math.min(Math.max(initialChildren, 0), 3);
  const [adults, setAdults] = useState(safeInitialAdults);
  const [children, setChildren] = useState(safeInitialChildren);
  const [ages, setAges] = useState<string[]>(Array.from({ length: safeInitialChildren }, () => ""));
  const [start, setStart] = useState<DateValue>(fromIso(initialCheckIn));
  const [end, setEnd] = useState<DateValue>(fromIso(initialCheckOut));
  const [invalidDate, setInvalidDate] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "checking" | "saving">("idle");
  const [bookingError, setBookingError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const filteredRooms = useMemo(
    () => initialRoom
      ? [...rooms.filter((room) => room.slug === initialRoom), ...rooms.filter((room) => room.slug !== initialRoom)]
      : rooms,
    [initialRoom, rooms],
  );
  const eligibleRooms = useMemo(
    () => filteredRooms.filter((room) => room.maxGuests >= adults + children),
    [adults, children, filteredRooms],
  );

  function resetSelection() {
    setSelection(null);
    setConfirmation(null);
    setBookingError("");
  }

  function updateAdults(value: number) {
    setAdults(value);
    setState("idle");
    resetSelection();
  }

  function updateChildren(value: number) {
    setChildren(value);
    setAges((current) => Array.from({ length: value }, (_, index) => current[index] ?? ""));
    setState("idle");
    resetSelection();
  }

  function updateDates(nextStart: DateValue, nextEnd: DateValue) {
    setStart(nextStart);
    setEnd(nextEnd);
    setInvalidDate("");
    setError("");
    setState("idle");
    resetSelection();
  }

  function search() {
    if (!rooms.length) {
      setError("Room information is unavailable. Check the Supabase connection and try again.");
      return;
    }
    if (!start || !end) {
      setError("Choose both arrival and departure dates.");
      return;
    }
    if (children > 0 && ages.some((age) => age === "")) {
      setError("Select an age for each child before checking rooms.");
      return;
    }

    const preferredRoom = eligibleRooms.find((room) => room.slug === initialRoom);
    const preferredRate = preferredRoom?.rates.find((rate) => rate.id === initialRate);
    setSelection(preferredRoom && preferredRate ? { room: preferredRoom, rate: preferredRate } : null);
    setError("");
    setState("loading");
    window.setTimeout(() => setState(eligibleRooms.length ? "ready" : "empty"), 450);
  }

  function chooseRate(room: Room, rate: RoomRate) {
    setSelection({ room, rate });
    setConfirmation(null);
    setBookingError("");
    window.requestAnimationFrame(() => document.getElementById("guest-details")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection || !start || !end) return;
    if (!isSupabaseConfigured) {
      setBookingError("Supabase is not configured yet. Add the project URL and publishable key to .env.local, then restart the site.");
      return;
    }

    const checkIn = toIso(start);
    const checkOut = toIso(end);
    const parsedAges = ages.map(Number);
    const nights = calendarNights(start, end);
    const totalPrice = selection.rate.price * nights;

    setBookingError("");
    setSubmitState("checking");

    const { data: available, error: availabilityError } = await supabase.rpc("check_room_availability", {
      p_room_type_id: selection.room.id,
      p_check_in: checkIn,
      p_check_out: checkOut,
    });

    if (availabilityError) {
      setSubmitState("idle");
      setBookingError("We could not verify availability right now. Please try again shortly.");
      return;
    }

    if (!available) {
      setSubmitState("idle");
      setBookingError("This room appears to be booked for the selected dates. Please choose another room or adjust your stay.");
      return;
    }

    const booking: BookingCreate = {
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim(),
      room_type_id: selection.room.id,
      rate_plan_id: selection.rate.id,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      children_ages: parsedAges,
      total_price: totalPrice,
    };

    setSubmitState("saving");
    const { error: insertError } = await supabase.from("bookings").insert(booking);

    if (insertError) {
      setSubmitState("idle");
      setBookingError("Your reservation request could not be saved. Please review the details and try again.");
      return;
    }

    setConfirmation({
      guestName: booking.guest_name,
      roomName: selection.room.name,
      rateName: selection.rate.name,
      checkIn,
      checkOut,
      guests: adults + children,
      nights,
      totalPrice,
      currency: selection.rate.currency,
    });
    setSubmitState("idle");
  }

  const stayNights = start && end ? calendarNights(start, end) : 0;
  const selectionTotal = selection ? selection.rate.price * stayNights : 0;

  return (
    <div>
      <section className="sticky top-[var(--nav-height)] z-30 border-y border-flora-line bg-flora-cream/95 shadow-[0_12px_40px_rgba(43,32,22,.08)] backdrop-blur-md">
        <div className="container-shell flex min-h-16 items-center justify-between gap-5 py-3">
          <p className="eyebrow text-flora-slate">Flora reservations</p>
          <p className="whitespace-nowrap font-sans text-[0.54rem] uppercase tracking-[0.1em] sm:text-[0.62rem] sm:tracking-[0.11em]">Your selection: <span className="text-flora-terracotta">{selection ? "1 room" : "0 rooms"}</span></p>
        </div>
      </section>

      <section className="section-pad bg-flora-cream">
        <div className="container-shell grid items-start gap-10 xl:grid-cols-[0.68fr_1.32fr] xl:gap-14">
          <aside className="border border-flora-line bg-flora-ivory p-6 xl:sticky xl:top-32">
            <p className="eyebrow text-flora-gold">1 · Guests</p>
            <h2 className="mt-3 font-display text-3xl">Who is staying?</h2>
            <div className="mt-4">
              <GuestStepper label="Adults" value={adults} min={1} max={4} setValue={updateAdults} />
              <GuestStepper label="Children" value={children} min={0} max={3} setValue={updateChildren} />
            </div>
            {children > 0 ? (
              <div className="mt-5 space-y-3">
                <p className="eyebrow text-flora-grey">Child ages</p>
                {ages.map((age, index) => (
                  <label key={index} className="flex items-center justify-between gap-4 text-base">
                    Child {index + 1}
                    <select className="rounded-full border border-flora-line bg-flora-cream px-4 py-2 font-sans text-xs" value={age} onChange={(event) => setAges((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} aria-label={`Age of child ${index + 1}`}>
                      <option value="">Age</option>
                      {Array.from({ length: 18 }, (_, ageValue) => <option key={ageValue} value={ageValue}>{ageValue}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            ) : null}
            <div className="mt-8 border-t border-flora-line pt-6">
              <p className="eyebrow text-flora-gold">2 · Stay</p>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between gap-3"><dt className="text-flora-grey">Arrival</dt><dd>{formatDate(start)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-flora-grey">Departure</dt><dd>{formatDate(end)}</dd></div>
              </dl>
            </div>
            <button type="button" className="luxury-button mt-7 w-full border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]" onClick={search}>Select a room</button>
            {error ? <p className="mt-4 border-l-2 border-flora-terracotta pl-4 text-sm leading-relaxed text-flora-terracotta" role="alert">{error}</p> : null}
          </aside>
          <div>
            <p className="eyebrow mb-4 text-flora-gold">Choose your dates</p>
            <Calendar start={start} end={end} onChange={updateDates} invalidDate={invalidDate} />
          </div>
        </div>
      </section>

      <section className="botanical textured section-pad min-h-[600px] bg-flora-blush" aria-labelledby="results-title">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="eyebrow text-flora-terracotta">3 · Your stay</p><h2 id="results-title" className="display-title mt-3 text-[clamp(3.2rem,6vw,6rem)]">Select a room</h2></div>
            <p className="max-w-xl text-lg leading-relaxed text-flora-grey">Compare Flora's room categories and choose the rate plan that suits your stay.</p>
          </div>

          {state === "idle" ? <div className="mt-12 border border-flora-line bg-flora-ivory p-10 text-center"><p className="font-display text-3xl">Choose dates, then select a room</p><p className="mt-3 text-flora-grey">Room options will appear here.</p></div> : null}
          {state === "loading" ? <div className="mt-12 flex min-h-72 flex-col items-center justify-center gap-5 border border-flora-line bg-flora-ivory"><span className="size-10 animate-spin rounded-full border border-flora-line border-t-flora-slate" aria-hidden="true" /><p className="eyebrow text-flora-grey" role="status">Preparing room options</p></div> : null}
          {state === "empty" ? <div className="mt-12 border border-flora-gold bg-[#F3E7B4] p-7" role="status"><h3 className="font-display text-3xl">No rooms can accommodate {adults + children} guests</h3><p className="mt-3 max-w-2xl text-flora-grey">Reduce the party size or contact [RESERVATIONS EMAIL] for multi-room assistance.</p></div> : null}
          {state === "ready" ? (
            <div className="mt-12 space-y-5">
              {eligibleRooms.map((room) => {
                const fromRate = room.rates.reduce<RoomRate | null>((lowest, rate) => !lowest || rate.price < lowest.price ? rate : lowest, null);
                return (
                  <article key={room.id} className="grid overflow-hidden border border-flora-line bg-flora-ivory md:grid-cols-[0.72fr_1.28fr]">
                    <div className="relative min-h-72"><Image src={room.images[0]} alt={`${room.name}, editorial placeholder`} fill sizes="(min-width:768px) 34vw, 100vw" className="object-cover" /></div>
                    <div className="p-6 sm:p-8">
                      <p className="eyebrow text-flora-gold">{room.size} · {room.occupancy}</p>
                      <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div><h3 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">{room.name}</h3><p className="mt-4 max-w-2xl text-lg leading-relaxed text-flora-grey">{room.summary}</p></div>
                        {fromRate ? <div className="shrink-0 lg:text-right"><p className="eyebrow text-flora-grey">From</p><p className="font-display text-4xl">{formatMoney(fromRate.price, fromRate.currency)}</p><p className="eyebrow mt-1 text-[0.5rem] text-flora-grey">per night</p></div> : null}
                      </div>
                      <div className="mt-6 divide-y divide-flora-line border-y border-flora-line">
                        {room.rates.map((rate) => (
                          <div key={rate.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
                            <div><p className="font-display text-xl">{rate.name}</p><p className="mt-1 text-sm text-flora-grey">{rate.policy}</p><p className="mt-2 font-sans text-[0.55rem] uppercase tracking-[0.11em] text-flora-slate">{formatMoney(rate.price, rate.currency)} per night</p></div>
                            <button type="button" className="luxury-button border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]" onClick={() => chooseRate(room, rate)}>{selection?.rate.id === rate.id ? "Selected rate" : "Choose this rate"}</button>
                          </div>
                        ))}
                        {!room.rates.length ? <p className="py-5 text-sm text-flora-grey">Rates are temporarily unavailable for this room.</p> : null}
                      </div>
                      <Link href={`/rooms/${room.slug}`} className="mt-5 inline-block border-b border-flora-slate font-sans text-[0.58rem] uppercase tracking-[0.12em] text-flora-slate">Room details</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {confirmation ? (
            <section id="guest-details" className="mt-10 border border-flora-gold bg-flora-ivory p-7 shadow-soft sm:p-10" aria-live="polite">
              <p className="eyebrow text-flora-gold">Reservation request received</p>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-none">Thank you, {confirmation.guestName}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-flora-grey">Your request is pending. Flora's reservations team will review the stay details and contact you using the information provided.</p>
              <dl className="mt-8 grid gap-5 border-y border-flora-line py-6 sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="eyebrow text-flora-grey">Room and rate</dt><dd className="mt-2 text-lg">{confirmation.roomName}<br />{confirmation.rateName}</dd></div>
                <div><dt className="eyebrow text-flora-grey">Stay</dt><dd className="mt-2 text-lg">{confirmation.checkIn}<br />to {confirmation.checkOut}</dd></div>
                <div><dt className="eyebrow text-flora-grey">Guests</dt><dd className="mt-2 text-lg">{confirmation.guests} · {confirmation.nights} {confirmation.nights === 1 ? "night" : "nights"}</dd></div>
                <div><dt className="eyebrow text-flora-grey">Estimated total</dt><dd className="mt-2 font-display text-3xl">{formatMoney(confirmation.totalPrice, confirmation.currency)}</dd></div>
              </dl>
            </section>
          ) : selection && start && end ? (
            <form id="guest-details" className="mt-10 grid gap-8 border border-flora-line bg-flora-ivory p-7 shadow-soft sm:p-10 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={submitBooking}>
              <div>
                <p className="eyebrow text-flora-terracotta">4 · Guest details</p>
                <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.4rem)] leading-none">Complete your request</h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2"><span className="eyebrow text-flora-grey">Full name</span><input className="field mt-2" name="guest_name" autoComplete="name" required value={guestName} onChange={(event) => setGuestName(event.target.value)} /></label>
                  <label className="block"><span className="eyebrow text-flora-grey">Email</span><input className="field mt-2" name="guest_email" type="email" autoComplete="email" required value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} /></label>
                  <label className="block"><span className="eyebrow text-flora-grey">Phone</span><input className="field mt-2" name="guest_phone" type="tel" autoComplete="tel" required value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} /></label>
                </div>
                {bookingError ? <p className="mt-5 border-l-2 border-flora-terracotta pl-4 text-sm leading-relaxed text-flora-terracotta" role="alert">{bookingError}</p> : null}
                <button type="submit" disabled={submitState !== "idle"} className="luxury-button mt-7 border-flora-slate text-flora-slate disabled:cursor-wait disabled:opacity-60 [--button-fill:var(--flora-slate-blue-deep)]">{submitState === "checking" ? "Checking availability…" : submitState === "saving" ? "Saving your request…" : "Send reservation request"}</button>
              </div>
              <aside className="border border-flora-line bg-flora-cream p-6">
                <p className="eyebrow text-flora-gold">Your selection</p>
                <h3 className="mt-3 font-display text-3xl">{selection.room.name}</h3>
                <p className="mt-2 text-flora-grey">{selection.rate.name}</p>
                <dl className="mt-6 space-y-3 border-y border-flora-line py-5">
                  <div className="flex justify-between gap-4"><dt className="text-flora-grey">Arrival</dt><dd>{formatDate(start)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-flora-grey">Departure</dt><dd>{formatDate(end)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-flora-grey">Guests</dt><dd>{adults + children}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-flora-grey">Nights</dt><dd>{stayNights}</dd></div>
                </dl>
                <div className="mt-5 flex items-end justify-between gap-4"><span className="eyebrow text-flora-grey">Estimated total</span><strong className="font-display text-4xl font-normal">{formatMoney(selectionTotal, selection.rate.currency)}</strong></div>
              </aside>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}

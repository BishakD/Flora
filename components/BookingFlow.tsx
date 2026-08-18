"use client";

import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Room, RoomRate } from "@/data/rooms";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { BookingCreate } from "@/types/database";

type DateValue = Date | null;

type Selection = {
  room: Room;
  rate: RoomRate;
};

// Booking confirmed screen data
type BookingConfirmed = {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  depositAmount: number;
  remainingBalance: number;
  currency: string;
  paymentId: string;
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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateStr(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(y, m - 1, d, 12);
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
  } catch {
    return dateStr;
  }
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

  // Multi-step submit states
  type SubmitState = "idle" | "creating-order" | "payment-open" | "verifying";
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [bookingError, setBookingError] = useState("");
  const [confirmed, setConfirmed] = useState<BookingConfirmed | null>(null);

  // Ref for the results section — used to scroll into view after search runs.
  const resultsRef = useRef<HTMLElement>(null);

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
    setConfirmed(null);
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
    window.setTimeout(() => {
      setState(eligibleRooms.length ? "ready" : "empty");
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 450);
  }

  // Auto-trigger search when the booking page is opened with pre-populated dates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialCheckIn && initialCheckOut && rooms.length) {
      search();
    }
  // Intentionally only runs once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseRate(room: Room, rate: RoomRate) {
    setSelection({ room, rate });
    setConfirmed(null);
    setBookingError("");
    window.requestAnimationFrame(() => document.getElementById("guest-details")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection || !start || !end) return;

    const checkIn = toIso(start);
    const checkOut = toIso(end);
    const parsedAges = ages.map(Number);
    const nights = calendarNights(start, end);
    const totalPrice = selection.rate.price * nights;
    const currency = selection.rate.currency;

    setBookingError("");
    setSubmitState("creating-order");

    // Step 1: Create booking row + Razorpay order on the server
    let bookingId: string;
    let razorpayOrderId: string;
    let depositAmount: number;

    try {
      const res = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        } satisfies BookingCreate),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitState("idle");
        setBookingError(data.error || "Could not initiate your booking. Please try again.");
        return;
      }

      bookingId = data.bookingId as string;
      razorpayOrderId = data.razorpayOrderId as string;
      depositAmount = data.depositAmount as number;
    } catch (err) {
      console.error("[BookingFlow] create-order network error:", err);
      setSubmitState("idle");
      setBookingError("A network error occurred. Please check your connection and try again.");
      return;
    }

    // Step 2: Open Razorpay modal directly on this page
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      setSubmitState("idle");
      setBookingError("Payment gateway is loading. Please try again in a moment.");
      // Best-effort cleanup of the draft booking
      fetch(`/api/bookings/${bookingId}`, { method: "DELETE" }).catch(() => {});
      return;
    }

    setSubmitState("payment-open");

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const remainingBalance = Math.max(0, Math.round((totalPrice - depositAmount) * 100) / 100);
    const roomName = selection.room.name;
    const rateName = selection.rate.name;

    const options = {
      key: keyId,
      amount: Math.round(depositAmount * 100),
      currency: "INR",
      name: "Flora Palazzo",
      description: `25% Deposit · ${roomName}`,
      order_id: razorpayOrderId,
      prefill: {
        name: guestName.trim(),
        email: guestEmail.trim(),
        contact: guestPhone.trim(),
      },
      theme: { color: "#1B2A3F" },
      modal: {
        ondismiss: () => {
          // Guest closed modal without paying — delete the draft booking row
          console.log("[BookingFlow] Modal dismissed without payment — cleaning up booking", bookingId);
          fetch(`/api/bookings/${bookingId}`, { method: "DELETE" }).catch(() => {});
          setSubmitState("idle");
          setBookingError("Payment was not completed. Your dates remain available — feel free to try again.");
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setSubmitState("verifying");
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            // Could be a race condition where room was taken
            if (verifyData.roomUnavailable) {
              setBookingError(verifyData.error || "This room was just booked by another guest. Your payment has been automatically refunded.");
            } else {
              setBookingError(verifyData.error || "Payment verification failed. Please contact our concierge team.");
            }
            setSubmitState("idle");
            return;
          }

          // Success — show confirmation screen
          setConfirmed({
            bookingId,
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim(),
            roomName,
            rateName,
            checkIn,
            checkOut,
            guests: adults + children,
            nights,
            totalPrice,
            depositAmount,
            remainingBalance,
            currency,
            paymentId: response.razorpay_payment_id,
          });
          setSubmitState("idle");
        } catch (err) {
          console.error("[BookingFlow] Verify network error:", err);
          setBookingError("Network error verifying payment. Please contact our concierge — your payment may have been captured.");
          setSubmitState("idle");
        }
      },
    };

    try {
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("[BookingFlow] Razorpay open error:", err);
      setSubmitState("idle");
      setBookingError("Failed to open payment window. Please try again.");
      fetch(`/api/bookings/${bookingId}`, { method: "DELETE" }).catch(() => {});
    }
  }

  const stayNights = start && end ? calendarNights(start, end) : 0;
  const selectionTotal = selection ? selection.rate.price * stayNights : 0;

  const isSubmitting = submitState !== "idle";
  const buttonLabel =
    submitState === "creating-order"
      ? "Preparing checkout…"
      : submitState === "payment-open"
      ? "Payment window open…"
      : submitState === "verifying"
      ? "Confirming payment…"
      : "Proceed to Payment";

  return (
    <div>
      {/* Preload Razorpay Checkout.js so the modal opens instantly */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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

      <section ref={resultsRef} className="botanical textured section-pad min-h-[600px] bg-flora-blush" aria-labelledby="results-title">
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

          {/* ── Booking Confirmed Success Screen ── */}
          {confirmed ? (
            <section id="guest-details" className="mt-10 border border-flora-gold bg-flora-ivory p-7 shadow-soft sm:p-10" aria-live="polite">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-flora-navy text-flora-ivory">✓</span>
                <p className="eyebrow text-flora-gold">Reservation Confirmed</p>
              </div>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-none">Thank you, {confirmed.guestName}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-flora-grey">
                Your deposit has been received and your reservation at Flora Palazzo is fully secured. A confirmation has been sent to <strong className="text-flora-charcoal">{confirmed.guestEmail}</strong>.
              </p>
              <dl className="mt-8 grid gap-5 border-y border-flora-line py-6 sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="eyebrow text-flora-grey">Room &amp; Rate</dt><dd className="mt-2 text-lg">{confirmed.roomName}<br />{confirmed.rateName}</dd></div>
                <div><dt className="eyebrow text-flora-grey">Stay</dt><dd className="mt-2 text-lg">{confirmed.checkIn}<br />to {confirmed.checkOut}</dd></div>
                <div><dt className="eyebrow text-flora-grey">Guests · Nights</dt><dd className="mt-2 text-lg">{confirmed.guests} · {confirmed.nights} {confirmed.nights === 1 ? "night" : "nights"}</dd></div>
                <div><dt className="eyebrow text-flora-grey">Total stay</dt><dd className="mt-2 font-display text-3xl">{formatMoney(confirmed.totalPrice, confirmed.currency)}</dd></div>
              </dl>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-flora-line bg-flora-cream p-4">
                  <dt className="eyebrow text-flora-grey text-[0.55rem]">Deposit Paid (25%)</dt>
                  <dd className="mt-1 font-display text-2xl text-flora-navy">{formatMoney(confirmed.depositAmount, confirmed.currency)}</dd>
                </div>
                <div className="rounded-lg border border-dashed border-flora-gold bg-flora-cream p-4">
                  <dt className="eyebrow text-flora-gold text-[0.55rem]">Balance at Check-in</dt>
                  <dd className="mt-1 font-display text-2xl text-flora-navy">{formatMoney(confirmed.remainingBalance, confirmed.currency)}</dd>
                </div>
                <div className="rounded-lg border border-flora-line bg-flora-cream p-4">
                  <dt className="eyebrow text-flora-grey text-[0.55rem]">Booking Reference</dt>
                  <dd className="mt-1 font-mono text-xs font-bold text-flora-slate">{confirmed.bookingId}</dd>
                </div>
              </dl>
              <div className="mt-8">
                <Link href="/" className="luxury-button inline-block border-flora-navy bg-flora-navy px-8 py-3 text-flora-ivory [--button-fill:var(--flora-slate)] [--button-ink:var(--flora-ivory-card)]">
                  Return to Flora
                </Link>
              </div>
            </section>

          ) : selection && start && end ? (
            <form id="guest-details" className="mt-10 grid gap-8 border border-flora-line bg-flora-ivory p-7 shadow-soft sm:p-10 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={submitBooking}>
              <div>
                <p className="eyebrow text-flora-terracotta">4 · Guest details</p>
                <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.4rem)] leading-none">Complete your booking</h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2"><span className="eyebrow text-flora-grey">Full name</span><input className="field mt-2" name="guest_name" autoComplete="name" required value={guestName} onChange={(event) => setGuestName(event.target.value)} /></label>
                  <label className="block"><span className="eyebrow text-flora-grey">Email</span><input className="field mt-2" name="guest_email" type="email" autoComplete="email" required value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} /></label>
                  <label className="block"><span className="eyebrow text-flora-grey">Phone</span><input className="field mt-2" name="guest_phone" type="tel" autoComplete="tel" required value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} /></label>
                </div>
                {bookingError ? <p className="mt-5 border-l-2 border-flora-terracotta pl-4 text-sm leading-relaxed text-flora-terracotta" role="alert">{bookingError}</p> : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="luxury-button mt-7 w-full border-flora-slate text-flora-slate disabled:cursor-wait disabled:opacity-60 [--button-fill:var(--flora-slate-blue-deep)]"
                >
                  {buttonLabel}
                </button>
                <p className="mt-3 flex items-center gap-2 font-sans text-[0.6rem] uppercase tracking-wider text-flora-grey">
                  <span>🔒</span>
                  <span>256-Bit Encrypted · Secure Razorpay Checkout · 25% Deposit Now</span>
                </p>
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
                <div className="mt-5 space-y-2">
                  <div className="flex items-end justify-between gap-4"><span className="eyebrow text-flora-grey">Total stay</span><strong className="font-display text-4xl font-normal">{formatMoney(selectionTotal, selection.rate.currency)}</strong></div>
                  <div className="flex items-end justify-between gap-4 border-t border-dashed border-flora-gold pt-2">
                    <span className="eyebrow text-flora-gold text-[0.55rem]">Deposit due now (25%)</span>
                    <strong className="font-display text-2xl font-normal text-flora-navy">{formatMoney(Math.round(selectionTotal * 0.25 * 100) / 100, selection.rate.currency)}</strong>
                  </div>
                </div>
              </aside>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}

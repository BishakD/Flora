"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ReceptionShell } from "@/app/reception/_components/ReceptionShell";
import type { Booking } from "@/types/database";

type BookingRow = Booking & {
  room_types: { name: string } | null;
  rate_plans: { name: string; currency?: string } | null;
};

function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Reusable booking row ───────────────────────────────────────────────────────

function BookingCard({ booking }: { booking: BookingRow }) {
  return (
    <div className="rounded border border-flora-line bg-flora-cream/40 px-4 py-3 font-sans text-[0.82rem] text-flora-charcoal space-y-1">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <span className="font-medium text-flora-navy">{booking.guest_name}</span>
        {booking.booking_reference && (
          <span className="font-mono text-[0.72rem] text-flora-gold tracking-wide">
            #{booking.booking_reference}
          </span>
        )}
      </div>
      <p className="text-flora-grey">
        {booking.room_types?.name ?? "—"} · {fmtDate(booking.check_in)} → {fmtDate(booking.check_out)}
      </p>
      <p className="text-flora-grey text-[0.75rem]">
        {booking.guest_email} · {booking.guest_phone}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReceptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [checkIns, setCheckIns] = useState<BookingRow[]>([]);
  const [checkOuts, setCheckOuts] = useState<BookingRow[]>([]);
  const [confirmed, setConfirmed] = useState<BookingRow[]>([]);

  useEffect(() => {
    async function init() {
      // 1. Verify session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/reception/login");
        return;
      }

      // 2. Verify role
      const { data: staffRow, error: staffError } = await supabase
        .from("staff")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (staffError || !staffRow || (staffRow.role !== "reception" && staffRow.role !== "admin")) {
        await supabase.auth.signOut();
        router.replace("/reception/login");
        return;
      }

      // 3. Load today's data
      const today = todayISO();

      const bookingSelect = `
        id, guest_name, guest_email, guest_phone,
        check_in, check_out, adults, children, children_ages,
        total_price, deposit_amount, payment_status,
        booking_reference, status, created_at,
        room_type_id, rate_plan_id, razorpay_order_id, razorpay_payment_id,
        room_types(name), rate_plans(name, currency)
      `;

      const [checkInRes, checkOutRes, confirmedRes] = await Promise.all([
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("check_in", today)
          .eq("status", "confirmed")
          .order("created_at"),
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("check_out", today)
          .eq("status", "confirmed")
          .order("created_at"),
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("status", "confirmed")
          .gte("check_in", today)
          .order("check_in"),
      ]);

      setCheckIns((checkInRes.data ?? []) as BookingRow[]);
      setCheckOuts((checkOutRes.data ?? []) as BookingRow[]);
      setConfirmed((confirmedRes.data ?? []) as BookingRow[]);

      if (checkInRes.error || checkOutRes.error || confirmedRes.error) {
        setAccessError("Some data could not be loaded. Please refresh.");
      }

      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return (
      <ReceptionShell title="Reception">
        <p className="font-sans text-[0.82rem] text-flora-grey">Loading…</p>
      </ReceptionShell>
    );
  }

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <ReceptionShell title="Reception">
      <p className="eyebrow text-flora-gold mb-6">{todayLabel}</p>

      {accessError && (
        <p role="alert" className="mb-4 font-sans text-[0.82rem] text-flora-terracotta">
          {accessError}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {/* Today's Check-ins */}
        <section className="rounded-lg border border-flora-line bg-flora-ivory p-5 shadow-lift">
          <p className="eyebrow text-flora-gold">Today</p>
          <h2 className="display-title mt-1 text-[1.2rem] text-flora-navy">
            Check-ins
            <span className="ml-2 font-sans text-[0.75rem] font-normal text-flora-grey">
              ({checkIns.length})
            </span>
          </h2>
          <div className="mt-4 space-y-3">
            {checkIns.length === 0 ? (
              <p className="font-sans text-[0.8rem] text-flora-grey">No check-ins today.</p>
            ) : (
              checkIns.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </div>
        </section>

        {/* Today's Check-outs */}
        <section className="rounded-lg border border-flora-line bg-flora-ivory p-5 shadow-lift">
          <p className="eyebrow text-flora-gold">Today</p>
          <h2 className="display-title mt-1 text-[1.2rem] text-flora-navy">
            Check-outs
            <span className="ml-2 font-sans text-[0.75rem] font-normal text-flora-grey">
              ({checkOuts.length})
            </span>
          </h2>
          <div className="mt-4 space-y-3">
            {checkOuts.length === 0 ? (
              <p className="font-sans text-[0.8rem] text-flora-grey">No check-outs today.</p>
            ) : (
              checkOuts.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </div>
        </section>

        {/* Upcoming Confirmed Bookings */}
        <section className="rounded-lg border border-flora-line bg-flora-ivory p-5 shadow-lift md:col-span-2 xl:col-span-1">
          <p className="eyebrow text-flora-gold">Upcoming</p>
          <h2 className="display-title mt-1 text-[1.2rem] text-flora-navy">
            Confirmed Bookings
            <span className="ml-2 font-sans text-[0.75rem] font-normal text-flora-grey">
              ({confirmed.length})
            </span>
          </h2>
          <div className="mt-4 max-h-[540px] space-y-3 overflow-y-auto pr-1">
            {confirmed.length === 0 ? (
              <p className="font-sans text-[0.8rem] text-flora-grey">No upcoming bookings.</p>
            ) : (
              confirmed.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </div>
        </section>

      </div>
    </ReceptionShell>
  );
}

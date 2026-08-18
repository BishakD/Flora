"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/types/database";
import { AdminShell } from "@/app/admin/_components/AdminShell";

// ─── Types ───────────────────────────────────────────────────────────────────

type BookingRow = Booking & {
  room_types: { name: string } | null;
  rate_plans: { name: string; currency?: string } | null;
  refund_error?: string | null;
};

type LoadState = "loading" | "ready" | "error";
type SupabaseError = { message: string; code?: string; details?: string; hint?: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
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

function getDisplayStatus(b: BookingRow): { label: string; className: string; description?: string } {
  if (b.payment_status === "refund_failed") {
    return {
      label: "Refund Failed",
      className: "bg-flora-blush text-flora-terracotta border border-flora-rose font-semibold",
      description: b.refund_error || "Payment refund API call failed. Manual action required.",
    };
  }

  if (b.payment_status === "refunded" || b.status === "cancelled") {
    return {
      label: "Refunded",
      className: "bg-flora-ice text-flora-slate border border-flora-line font-medium",
    };
  }

  if (b.payment_status === "deposit_paid") {
    return {
      label: "Paid",
      className: "bg-flora-sage/70 text-flora-navy border border-flora-sage font-medium",
    };
  }

  return {
    label: "Unpaid",
    className: "bg-flora-cream text-flora-grey border border-flora-line",
  };
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CancelBookingModal({
  booking,
  onConfirm,
  onCancel,
  busy,
}: {
  booking: BookingRow;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const currency = booking.rate_plans?.currency || "INR";
  const depositAmount =
    typeof booking.deposit_amount === "number" && booking.deposit_amount > 0
      ? booking.deposit_amount
      : Math.round(Number(booking.total_price) * 0.25);
  const formattedDeposit = formatMoney(depositAmount, currency);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-flora-espresso/40 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg border border-flora-line bg-flora-ivory p-7 shadow-lift">
        <p className="eyebrow text-flora-gold">Cancel &amp; Refund</p>
        <h2
          id="cancel-modal-title"
          className="display-title mt-1 text-[1.3rem] text-flora-navy"
        >
          Cancel this booking and refund {formattedDeposit}?
        </h2>
        <div className="mt-4 rounded border border-flora-line bg-flora-cream/50 p-3 font-sans text-[0.78rem] text-flora-charcoal space-y-1.5">
          <p><span className="text-flora-grey">Guest:</span> <strong className="font-medium">{booking.guest_name}</strong></p>
          <p><span className="text-flora-grey">Room:</span> {booking.room_types?.name ?? "Flora Room"}</p>
          <p><span className="text-flora-grey">Dates:</span> {fmtDate(booking.check_in)} – {fmtDate(booking.check_out)}</p>
          <p><span className="text-flora-grey">Refund Amount:</span> <strong className="text-flora-navy font-semibold">{formattedDeposit}</strong></p>
        </div>
        <p className="mt-3 font-sans text-[0.8rem] text-flora-grey leading-relaxed">
          This will issue a Razorpay refund for the deposit amount and send the cancellation confirmation email to <strong className="text-flora-charcoal">{booking.guest_email}</strong>.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="luxury-button border-flora-line text-flora-grey [--button-fill:var(--flora-sage)] [--button-ink:var(--flora-navy)] disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="luxury-button border-flora-terracotta text-flora-terracotta [--button-fill:var(--flora-terracotta)] [--button-ink:var(--flora-ivory-card)] disabled:opacity-50"
          >
            {busy ? "Processing Refund…" : "Confirm Cancellation & Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteBookingModal({
  booking,
  onConfirm,
  onCancel,
  busy,
}: {
  booking: BookingRow;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-flora-espresso/40 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg border border-flora-line bg-flora-ivory p-7 shadow-lift">
        <p className="eyebrow text-flora-terracotta">Permanent Deletion</p>
        <h2
          id="delete-modal-title"
          className="display-title mt-1 text-[1.3rem] text-flora-navy"
        >
          Permanently delete this booking?
        </h2>
        <p className="mt-3 font-sans text-[0.82rem] text-flora-terracotta font-medium">
          This cannot be undone and does NOT issue a refund.
        </p>
        <div className="mt-3 rounded border border-flora-line bg-flora-cream/50 p-3 font-sans text-[0.78rem] text-flora-charcoal space-y-1">
          <p><span className="text-flora-grey">Guest:</span> <strong>{booking.guest_name}</strong></p>
          <p><span className="text-flora-grey">Ref:</span> <span className="font-mono text-xs">{booking.id}</span></p>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="luxury-button border-flora-line text-flora-grey [--button-fill:var(--flora-sage)] [--button-ink:var(--flora-navy)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="luxury-button border-flora-terracotta text-flora-terracotta [--button-fill:var(--flora-terracotta)] [--button-ink:var(--flora-ivory-card)] disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard Component ───────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [fetchError, setFetchError] = useState<SupabaseError | null>(null);

  // Actions & Modals
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BookingRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const isFetchingRef = useRef(false);

  // ── Fetch Bookings ─────────────────────────────────────────────────────────
  const fetchBookings = useCallback(
    async (isInitial = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isInitial) setLoadState("loading");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*, room_types(name), rate_plans!bookings_rate_plan_id_fkey(name, currency)")
        .order("created_at", { ascending: false });

      isFetchingRef.current = false;

      if (error) {
        if (isInitial) {
          const extracted: SupabaseError = {
            message: error.message,
            code: (error as unknown as Record<string, string>).code ?? undefined,
            details: (error as unknown as Record<string, string>).details ?? undefined,
            hint: (error as unknown as Record<string, string>).hint ?? undefined,
          };
          setFetchError(extracted);
          setLoadState("error");
        }
      } else {
        setBookings((data as BookingRow[]) ?? []);
        setLastRefreshed(new Date());
        if (isInitial) setLoadState("ready");
      }
    },
    [router],
  );

  // Initial load
  useEffect(() => {
    fetchBookings(true);
  }, [fetchBookings]);

  // ── Auto-refresh: Polling every 20 seconds ─────────────────────────────────
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchBookings(false);
    }, 20000);

    return () => clearInterval(pollInterval);
  }, [fetchBookings]);

  // ── Live Supabase Realtime Subscription ────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          // Re-fetch joined booking data when any booking changes
          fetchBookings(false);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  // ── Cancel & Refund Action ─────────────────────────────────────────────────
  async function handleCancelBooking() {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/admin/bookings/${cancelTarget.id}/status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === cancelTarget.id
              ? {
                  ...b,
                  status: "cancelled",
                  payment_status: data.payment_status ?? "refunded",
                  refund_error: data.refund_error ?? null,
                }
              : b,
          ),
        );
        setCancelTarget(null);
      } else {
        console.error("[Admin] Cancel failed:", data);
        alert(`Cancellation failed:\n${data.error || data.refund_error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("[Admin] Cancellation network error:", err);
      alert("Network error processing cancellation.");
    } finally {
      setCancelling(false);
    }
  }

  // ── Delete Action ──────────────────────────────────────────────────────────
  async function handleDeleteBooking() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/admin/bookings/${deleteTarget.id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        // Fallback to direct client delete
        const { error } = await supabase.from("bookings").delete().eq("id", deleteTarget.id);
        if (!error) {
          setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
          setDeleteTarget(null);
        } else {
          console.error("[Admin] Delete failed:", error);
          alert(`Failed to delete booking:\n${error.message}`);
        }
      }
    } catch (err: any) {
      console.error("[Admin] Delete network error:", err);
      alert("Network error deleting booking.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Render States ──────────────────────────────────────────────────────────

  if (loadState === "loading") {
    return (
      <AdminShell title="Bookings">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="size-8 animate-spin rounded-full border-2 border-flora-line border-t-flora-navy" />
            <p className="eyebrow text-flora-grey">Loading reservations…</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (loadState === "error") {
    return (
      <AdminShell title="Bookings">
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="font-sans text-sm font-medium text-flora-terracotta">
            Failed to load bookings.
          </p>
          {fetchError && (
            <div className="max-w-lg rounded border border-flora-line bg-flora-ivory p-5 font-sans text-[0.78rem] text-flora-charcoal space-y-2">
              <p><span className="font-medium">Error:</span> {fetchError.message}</p>
              {fetchError.code && <p><span className="font-medium">Code:</span> {fetchError.code}</p>}
              {fetchError.hint && <p><span className="font-medium">Hint:</span> {fetchError.hint}</p>}
            </div>
          )}
          <button
            type="button"
            onClick={() => fetchBookings(true)}
            className="luxury-button border-flora-navy text-flora-navy [--button-fill:var(--flora-navy)] [--button-ink:var(--flora-ivory-card)]"
          >
            Retry
          </button>
        </div>
      </AdminShell>
    );
  }

  // ── Minimal Dashboard View ─────────────────────────────────────────────────

  return (
    <>
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          onConfirm={handleCancelBooking}
          onCancel={() => setCancelTarget(null)}
          busy={cancelling}
        />
      )}

      {deleteTarget && (
        <DeleteBookingModal
          booking={deleteTarget}
          onConfirm={handleDeleteBooking}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}

      <AdminShell title="Bookings">
        {/* Header Bar with Live Indicator & Refresh */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flora-sage opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-flora-sage" />
            </span>
            <span className="font-sans text-[0.68rem] tracking-wider uppercase text-flora-grey">
              Auto-refreshing · Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-sans text-[0.65rem] text-flora-grey">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              type="button"
              onClick={() => fetchBookings(false)}
              className="font-sans text-[0.65rem] uppercase tracking-wider text-flora-slate hover:text-flora-navy border-b border-flora-slate/40 pb-0.5"
              title="Refresh now"
            >
              Refresh
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-lg border border-flora-line bg-flora-ivory p-16 text-center shadow-soft">
            <p className="font-display text-2xl text-flora-navy">No reservations yet</p>
            <p className="mt-2 font-sans text-sm text-flora-grey">
              New bookings will automatically appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-flora-line bg-flora-ivory shadow-soft">
            <table className="w-full border-collapse font-sans text-[0.8rem] text-flora-charcoal">
              <thead>
                <tr className="border-b border-flora-line bg-flora-cream/60 text-left">
                  {[
                    "Guest Name",
                    "Contact Details",
                    "Guests",
                    "Dates",
                    "Room",
                    "Booking Reference",
                    "Amount Paid",
                    "Status",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em] text-flora-grey"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-flora-line/60">
                {bookings.map((b, i) => {
                  const currency = b.rate_plans?.currency || "INR";
                  const depositPaidAmount =
                    typeof b.deposit_amount === "number" && b.deposit_amount > 0
                      ? b.deposit_amount
                      : Math.round(Number(b.total_price) * 0.25);

                  const statusInfo = getDisplayStatus(b);
                  const isCancelled = b.status === "cancelled" || b.payment_status === "refunded";

                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors duration-150 hover:bg-flora-cream/40 ${
                        i % 2 === 0 ? "bg-flora-ivory" : "bg-flora-cream/20"
                      }`}
                    >
                      {/* 1. Guest Name */}
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-flora-navy">
                        {b.guest_name}
                      </td>

                      {/* 2. Contact Details (Email + Phone) */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-flora-charcoal">{b.guest_email}</div>
                        <div className="text-flora-grey font-mono text-[0.72rem]">{b.guest_phone}</div>
                      </td>

                      {/* 3. Guests (No. of Adults & Children) */}
                      <td className="px-4 py-3 whitespace-nowrap text-flora-charcoal">
                        <span>{b.adults} {b.adults === 1 ? "Adult" : "Adults"}</span>
                        {b.children > 0 ? (
                          <span className="text-flora-grey ml-1">· {b.children} {b.children === 1 ? "Child" : "Children"}</span>
                        ) : null}
                      </td>

                      {/* 4. Check-in / Check-out Dates */}
                      <td className="px-4 py-3 whitespace-nowrap text-flora-charcoal">
                        <span>{fmtDate(b.check_in)}</span>
                        <span className="text-flora-grey mx-1.5">→</span>
                        <span>{fmtDate(b.check_out)}</span>
                      </td>

                      {/* 5. Room Name */}
                      <td className="px-4 py-3 whitespace-nowrap text-flora-charcoal">
                        {b.room_types?.name ?? "Flora Room"}
                      </td>

                      {/* 6. Booking Reference */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-flora-slate" title={b.id}>
                          {b.id}
                        </span>
                      </td>

                      {/* 6. Amount Paid */}
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-flora-navy">
                        {b.payment_status === "deposit_paid" || b.payment_status === "refunded"
                          ? formatMoney(depositPaidAmount, currency)
                          : b.deposit_amount
                          ? formatMoney(b.deposit_amount, currency)
                          : "—"}
                      </td>

                      {/* 7. Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[0.62rem] tracking-wide ${statusInfo.className}`}
                          title={statusInfo.description}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* 8. Actions (Cancel & Delete) */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isCancelled || cancelling}
                            onClick={() => setCancelTarget(b)}
                            className="luxury-button border-flora-rose text-flora-terracotta [--button-fill:var(--flora-blush)] [--button-ink:var(--flora-espresso)] px-3 py-1 text-[0.56rem] disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={`Cancel and refund booking for ${b.guest_name}`}
                          >
                            {isCancelled ? "Cancelled" : "Cancel"}
                          </button>

                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => setDeleteTarget(b)}
                            className="luxury-button border-flora-terracotta text-flora-terracotta [--button-fill:var(--flora-terracotta)] [--button-ink:var(--flora-ivory-card)] px-3 py-1 text-[0.56rem] disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={`Permanently delete booking for ${b.guest_name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between font-sans text-[0.7rem] text-flora-grey">
          <span>{bookings.length} reservation{bookings.length !== 1 ? "s" : ""} total</span>
          <span>Flora Palazzo Hotel Admin</span>
        </div>
      </AdminShell>
    </>
  );
}

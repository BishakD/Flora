"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/types/database";
import { AdminShell } from "@/app/admin/_components/AdminShell";

// ─── Types ───────────────────────────────────────────────────────────────────

type BookingRow = Booking & {
  room_types: { name: string } | null;
  rate_plans: { name: string; currency?: string } | null;
};

type LoadState = "loading" | "ready" | "error";
type SupabaseError = { message: string; code?: string; details?: string; hint?: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDatetime(dt: string) {
  return new Date(dt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusPill(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    pending:
      "bg-flora-blush/60 text-flora-espresso border border-flora-rose/40",
    confirmed:
      "bg-flora-sage/60 text-flora-navy border border-flora-sage",
    cancelled:
      "bg-flora-ice text-flora-grey border border-flora-line",
  };
  return map[status] ?? map.pending;
}

function paymentStatusPill(status?: string | null) {
  const normalized = status || "unpaid";
  const map: Record<string, { label: string; className: string }> = {
    unpaid: {
      label: "Unpaid",
      className: "bg-flora-ice text-flora-grey border border-flora-line",
    },
    awaiting_payment: {
      label: "Awaiting Deposit",
      className: "bg-flora-blush/60 text-flora-espresso border border-flora-rose/40",
    },
    deposit_paid: {
      label: "Deposit Paid",
      className: "bg-flora-sage/70 text-flora-navy border border-flora-sage font-medium",
    },
  };
  return map[normalized] ?? map.unpaid;
}

// ─── Delete confirm modal ──────────────────────────────────────────────────────

function BookingDeleteModal({
  guestName,
  onConfirm,
  onCancel,
  busy,
}: {
  guestName: string;
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
        <p className="eyebrow text-flora-gold">Confirm deletion</p>
        <h2
          id="delete-modal-title"
          className="display-title mt-1 text-[1.3rem] text-flora-navy"
        >
          Delete booking for {guestName}?
        </h2>
        <p className="mt-3 font-sans text-[0.82rem] text-flora-grey">
          This will permanently remove the booking. This action cannot be undone.
        </p>
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
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<BookingRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [fetchError, setFetchError] = useState<SupabaseError | null>(null);

  // ── Session guard + initial data fetch ──────────────────────────────────────
  const bootstrap = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*, room_types(name), rate_plans!bookings_rate_plan_id_fkey(name, currency)")
      .order("created_at", { ascending: false });

    if (error) {
      const extracted: SupabaseError = {
        message: error.message,
        code:    (error as unknown as Record<string, string>).code    ?? undefined,
        details: (error as unknown as Record<string, string>).details ?? undefined,
        hint:    (error as unknown as Record<string, string>).hint    ?? undefined,
      };
      console.error("[Admin] Bookings fetch failed");
      console.error("  message:", extracted.message);
      console.error("  code:   ", extracted.code);
      console.error("  details:", extracted.details);
      console.error("  hint:   ", extracted.hint);
      setFetchError(extracted);
      setLoadState("error");
    } else {
      setBookings((data as BookingRow[]) ?? []);
      setLoadState("ready");
    }
  }, [router]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // ── Realtime subscription for live payment_status and booking updates ────────
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const updatedRow = payload.new as Partial<BookingRow>;
          if (!updatedRow || !updatedRow.id) return;

          setBookings((prev) =>
            prev.map((b) =>
              b.id === updatedRow.id
                ? {
                    ...b,
                    ...updatedRow,
                    room_types: b.room_types,
                    rate_plans: b.rate_plans,
                  }
                : b
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Status update ────────────────────────────────────────────────────────────
  async function updateStatus(id: string, status: "confirmed" | "cancelled") {
    setUpdatingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      } else {
        const data = await res.json();
        console.error("Failed to update status details:", data);
        const detailedMessage = [
          data.error,
          data.hint ? `\nHint: ${data.hint}` : "",
          data.code ? `\nCode: ${data.code}` : "",
        ]
          .filter(Boolean)
          .join("");
        alert(`Failed to update status:\n${detailedMessage || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Network error updating booking status.");
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Delete booking ─────────────────────────────────────────────────────────────
  async function handleDeleteBooking() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("bookings").delete().eq("id", deleteTarget.id);
    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    } else {
      console.error("Failed to delete booking", error);
      alert("Failed to delete booking. See console.");
    }
    setDeleteTarget(null);
    setDeleting(false);
  }

  // ── Render states ────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <AdminShell title="Bookings">
        <div className="flex py-32 items-center justify-center">
          <p className="eyebrow text-flora-grey">Loading…</p>
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
              {fetchError.code    && <p><span className="font-medium">Code:</span>    {fetchError.code}</p>}
              {fetchError.hint    && <p><span className="font-medium">Hint:</span>    {fetchError.hint}</p>}
              {fetchError.details && <p><span className="font-medium">Details:</span> {JSON.stringify(fetchError.details, null, 2)}</p>}
              <p className="mt-3 border-t border-flora-line pt-3 text-flora-grey">
                If you see a permission/RLS error, run{" "}
                <code className="rounded bg-flora-cream px-1 font-mono text-flora-navy">supabase/admin_rls.sql</code>{" "}
                in the Supabase SQL Editor and refresh.
              </p>
            </div>
          )}
        </div>
      </AdminShell>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <>
      {deleteTarget && (
        <BookingDeleteModal
          guestName={deleteTarget.guest_name}
          onConfirm={handleDeleteBooking}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}

      <AdminShell title="Bookings">
          {bookings.length === 0 ? (
            <p className="py-16 text-center font-sans text-sm text-flora-grey">
              No bookings yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-flora-line bg-flora-ivory shadow-soft">
              <table className="w-full border-collapse font-sans text-[0.8rem] text-flora-charcoal">
                <thead>
                  <tr className="border-b border-flora-line bg-flora-cream/60 text-left">
                    {[
                      "Guest Name",
                      "Email",
                      "Room",
                      "Rate Plan",
                      "Check-in",
                      "Check-out",
                      "Guests",
                      "Total",
                      "Deposit",
                      "Status",
                      "Payment",
                      "Created",
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
                <tbody>
                  {bookings.map((b, i) => {
                    const isBusy = updatingId === b.id;
                    return (
                      <tr
                        key={b.id}
                        className={`border-b border-flora-line/60 transition-colors duration-150 hover:bg-flora-cream/40 ${
                          i % 2 === 0 ? "" : "bg-flora-cream/20"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">{b.guest_name}</td>
                        <td className="px-4 py-3 text-flora-grey">{b.guest_email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {b.room_types?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-flora-grey">
                          {b.rate_plans?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(b.check_in)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmt(b.check_out)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {b.adults}
                          {b.children > 0 && (
                            <span className="ml-1 text-flora-grey">+{b.children}c</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {formatMoney(b.total_price, b.rate_plans?.currency || "INR")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-flora-slate">
                          {b.deposit_amount ? formatMoney(b.deposit_amount, b.rate_plans?.currency || "INR") : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[0.62rem] font-medium capitalize tracking-wide ${statusPill(b.status)}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[0.62rem] font-medium tracking-wide ${paymentStatusPill(b.payment_status).className}`}
                          >
                            {paymentStatusPill(b.payment_status).label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-flora-grey">
                          {fmtDatetime(b.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isBusy || b.status === "confirmed"}
                              onClick={() => updateStatus(b.id, "confirmed")}
                              className="luxury-button border-flora-sage text-flora-slate [--button-fill:var(--flora-sage)] [--button-ink:var(--flora-navy)] px-3 py-1 text-[0.56rem] disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label={`Confirm booking for ${b.guest_name}`}
                            >
                              {isBusy ? "…" : "Confirm"}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy || b.status === "cancelled"}
                              onClick={() => updateStatus(b.id, "cancelled")}
                              className="luxury-button border-flora-rose text-flora-terracotta [--button-fill:var(--flora-blush)] [--button-ink:var(--flora-espresso)] px-3 py-1 text-[0.56rem] disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label={`Cancel booking for ${b.guest_name}`}
                            >
                              {isBusy ? "…" : "Cancel"}
                            </button>
                            <button
                              type="button"
                              disabled={isBusy || deleting}
                              onClick={() => setDeleteTarget(b)}
                              className="luxury-button border-flora-terracotta text-flora-terracotta [--button-fill:var(--flora-terracotta)] [--button-ink:var(--flora-ivory-card)] px-3 py-1 text-[0.56rem] disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label={`Delete booking for ${b.guest_name}`}
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

          {/* Booking count footer */}
          <p className="mt-4 text-right font-sans text-[0.7rem] text-flora-grey">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
      </AdminShell>
    </>
  );
}

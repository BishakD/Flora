"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import type { RatePlan, RoomType } from "@/types/database";

type RatePlanRow = RatePlan & { room_types: { name: string } | null };

// ─── Delete confirm modal ────────────────────────────────────────────────────

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  busy,
}: {
  name: string;
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
          Delete &ldquo;{name}&rdquo;?
        </h2>
        <p className="mt-3 font-sans text-[0.82rem] text-flora-grey">
          This will permanently remove the rate plan. Bookings already made on
          this rate will be affected.
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RatePlansPage() {
  useAdminSession();

  const [plans, setPlans] = useState<RatePlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RatePlanRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rate_plans")
      .select("*, room_types(name)")
      .order("created_at", { ascending: true });
    setPlans((data as RatePlanRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("rate_plans").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    fetchPlans();
  }

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}

      <AdminShell title="Rate Plans">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="font-sans text-[0.78rem] text-flora-grey">
            {loading ? "Loading…" : `${plans.length} rate plan${plans.length !== 1 ? "s" : ""}`}
          </p>
          <Link
            href="/admin/rate-plans/new"
            className="luxury-button border-flora-navy bg-flora-navy text-flora-ivory [--button-fill:var(--flora-slate)] [--button-ink:var(--flora-ivory-card)]"
          >
            + Add rate plan
          </Link>
        </div>

        {!loading && plans.length === 0 && (
          <p className="py-16 text-center font-sans text-sm text-flora-grey">
            No rate plans yet.{" "}
            <Link href="/admin/rate-plans/new" className="underline">
              Add one.
            </Link>
          </p>
        )}

        {plans.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-flora-line bg-flora-ivory shadow-soft">
            <table className="w-full border-collapse font-sans text-[0.8rem] text-flora-charcoal">
              <thead>
                <tr className="border-b border-flora-line bg-flora-cream/60 text-left">
                  {[
                    "Room Type",
                    "Plan Name",
                    "Price / night",
                    "Currency",
                    "Cancellation",
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
                {plans.map((plan, i) => (
                  <tr
                    key={plan.id}
                    className={`border-b border-flora-line/60 transition-colors duration-150 hover:bg-flora-cream/40 ${
                      i % 2 === 0 ? "" : "bg-flora-cream/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {plan.room_types?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{plan.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: plan.currency || "INR",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(plan.price_per_night))}
                    </td>
                    <td className="px-4 py-3 text-flora-grey">{plan.currency}</td>
                    <td className="max-w-xs px-4 py-3 text-flora-grey">
                      <span className="line-clamp-2">{plan.cancellation_policy}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/rate-plans/${plan.id}/edit`}
                          className="luxury-button border-flora-blue text-flora-slate [--button-fill:var(--flora-blue)] [--button-ink:var(--flora-ivory-card)] p-2"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(plan)}
                          className="luxury-button border-flora-rose text-flora-terracotta [--button-fill:var(--flora-blush)] [--button-ink:var(--flora-espresso)] p-2"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminShell>
    </>
  );
}

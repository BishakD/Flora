"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import type { RatePlan, RoomType } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RatePlanFormProps {
  /** Existing rate plan — omit for "new" mode */
  initial?: RatePlan;
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="eyebrow text-flora-grey">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-sans text-[0.72rem] text-flora-terracotta">{error}</p>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RatePlanForm({ initial }: RatePlanFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [roomTypes,   setRoomTypes]   = useState<RoomType[]>([]);
  const [roomTypeId,  setRoomTypeId]  = useState(initial?.room_type_id ?? "");
  const [name,        setName]        = useState(initial?.name          ?? "");
  const [price,       setPrice]       = useState(String(initial?.price_per_night ?? ""));
  const [currency,    setCurrency]    = useState(initial?.currency       ?? "INR");
  const [cancellation, setCancellation] = useState(initial?.cancellation_policy ?? "");
  const [bookingNote, setBookingNote] = useState(initial?.booking_note  ?? "");

  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Load room types for the dropdown ───────────────────────────────────────
  useEffect(() => {
    supabase
      .from("room_types")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setRoomTypes((data as RoomType[]) ?? []);
        // Pre-select first room if creating new
        if (!initial && data && data.length > 0 && !roomTypeId) {
          setRoomTypeId(data[0].id);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!roomTypeId)        e.roomTypeId    = "Select a room type.";
    if (!name.trim())       e.name          = "Plan name is required.";
    if (!cancellation.trim()) e.cancellation = "Cancellation policy is required.";
    if (!bookingNote.trim())  e.bookingNote  = "Booking note is required.";

    const p = Number(price);
    if (!price || isNaN(p) || p < 0)
      e.price = "Price must be a non-negative number.";

    return e;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      room_type_id:        roomTypeId,
      name:                name.trim(),
      price_per_night:     Number(price),
      currency:            currency.trim() || "INR",
      cancellation_policy: cancellation.trim(),
      booking_note:        bookingNote.trim(),
    };

    setSaving(true);

    let error;
    if (isEdit && initial) {
      ({ error } = await supabase
        .from("rate_plans")
        .update(payload)
        .eq("id", initial.id));
    } else {
      ({ error } = await supabase.from("rate_plans").insert(payload));
    }

    setSaving(false);

    if (error) {
      setApiError(error.message);
      return;
    }

    router.push("/admin/rate-plans");
    router.refresh();
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const title = isEdit ? `Edit · ${initial?.name}` : "New Rate Plan";

  return (
    <AdminShell title={title}>
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

          {/* Room type dropdown */}
          <Field label="Room type" id="roomTypeId" error={errors.roomTypeId}>
            <select
              id="roomTypeId"
              className="field cursor-pointer"
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              disabled={isEdit}
            >
              {roomTypes.length === 0 && (
                <option value="" disabled>Loading room types…</option>
              )}
              {roomTypes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {isEdit && (
              <p className="font-sans text-[0.72rem] text-flora-grey/70">
                Room type cannot be changed on an existing plan.
              </p>
            )}
          </Field>

          {/* Plan name */}
          <Field label="Plan name" id="name" error={errors.name}>
            <input
              id="name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flora Flexible"
            />
          </Field>

          {/* Price + currency — side by side */}
          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <Field label="Price per night" id="price" error={errors.price}>
              <input
                id="price"
                type="number"
                min={0}
                step={0.01}
                className="field"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="420.00"
              />
            </Field>
            <Field label="Currency" id="currency" error={undefined}>
              <input
                id="currency"
                className="field w-20 uppercase"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              />
            </Field>
          </div>

          {/* Cancellation policy */}
          <Field
            label="Cancellation policy"
            id="cancellation"
            error={errors.cancellation}
          >
            <textarea
              id="cancellation"
              rows={2}
              className="field resize-y"
              value={cancellation}
              onChange={(e) => setCancellation(e.target.value)}
              placeholder="e.g. Free cancellation until 3 days before arrival."
            />
          </Field>

          {/* Booking note */}
          <Field label="Booking note" id="bookingNote" error={errors.bookingNote}>
            <textarea
              id="bookingNote"
              rows={2}
              className="field resize-y"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
              placeholder="e.g. Card guarantee required."
            />
          </Field>

          {/* API error */}
          {apiError && (
            <p role="alert" className="font-sans text-[0.78rem] text-flora-terracotta">
              {apiError}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="luxury-button border-flora-navy bg-flora-navy text-flora-ivory [--button-fill:var(--flora-slate)] [--button-ink:var(--flora-ivory-card)] disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create rate plan"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/rate-plans")}
              className="luxury-button border-flora-line text-flora-grey [--button-fill:var(--flora-sage)] [--button-ink:var(--flora-navy)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}

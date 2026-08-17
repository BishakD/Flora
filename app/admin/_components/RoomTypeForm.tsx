"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import type { RoomType } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomTypeFormProps {
  /** Existing room — omit for "new" mode */
  initial?: RoomType;
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

export function RoomTypeForm({ initial }: RoomTypeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name,        setName]        = useState(initial?.name        ?? "");
  const [eyebrow,     setEyebrow]     = useState(initial?.eyebrow     ?? "");
  const [summary,     setSummary]     = useState(initial?.summary     ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sizeLabel,   setSizeLabel]   = useState(initial?.size_label  ?? "");
  const [maxGuests,   setMaxGuests]   = useState(String(initial?.max_guests ?? "2"));
  const [bed,         setBed]         = useState(initial?.bed         ?? "");
  const [view,        setView]        = useState(initial?.view        ?? "");

  // Amenities — one per line in a textarea, stored as string[]
  const [amenities, setAmenities] = useState(
    (initial?.amenities ?? []).join("\n")
  );

  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name        = "Name is required.";
    if (!eyebrow.trim())     e.eyebrow     = "Eyebrow label is required.";
    if (!summary.trim())     e.summary     = "Summary is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (!sizeLabel.trim())   e.sizeLabel   = "Size label is required.";
    if (!bed.trim())         e.bed         = "Bed type is required.";
    if (!view.trim())        e.view        = "View description is required.";

    const guests = Number(maxGuests);
    if (!maxGuests || isNaN(guests) || guests < 1)
      e.maxGuests = "Must be a positive number.";

    const amenityList = amenities.split("\n").map((s) => s.trim()).filter(Boolean);
    if (amenityList.length === 0)
      e.amenities = "At least one amenity is required.";

    if (imageUrls.length === 0)
      e.imageUrls = "At least one image must be uploaded.";

    return e;
  }

  // ── Image Uploads ───────────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setApiError(null);

    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("room-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setApiError(`Failed to upload ${file.name}: ${error.message}`);
        break;
      }

      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("room-images").getPublicUrl(data.path);
        newUrls.push(publicUrl);
      }
    }

    setImageUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
    
    // Reset input
    e.target.value = "";
  }

  function handleImageRemove(urlToRemove: string) {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const amenityList = amenities.split("\n").map((s) => s.trim()).filter(Boolean);

    // Build slug from name
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const payload = {
      name:        name.trim(),
      slug,
      eyebrow:     eyebrow.trim(),
      summary:     summary.trim(),
      description: description.trim(),
      size_label:  sizeLabel.trim(),
      max_guests:  Number(maxGuests),
      bed:         bed.trim(),
      view:        view.trim(),
      amenities:   amenityList,
      image_urls:  imageUrls,
    };

    setSaving(true);

    let error;
    if (isEdit && initial) {
      ({ error } = await supabase
        .from("room_types")
        .update(payload)
        .eq("id", initial.id));
    } else {
      ({ error } = await supabase
        .from("room_types")
        .insert(payload));
    }

    setSaving(false);

    if (error) {
      setApiError(error.message);
      return;
    }

    router.push("/admin/room-types");
    router.refresh();
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const title = isEdit ? `Edit · ${initial?.name}` : "New Room Type";

  return (
    <AdminShell title={title}>
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

          {/* Name */}
          <Field label="Name" id="name" error={errors.name}>
            <input
              id="name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heritage Suite"
            />
          </Field>

          {/* Eyebrow */}
          <Field label="Eyebrow label" id="eyebrow" error={errors.eyebrow}>
            <input
              id="eyebrow"
              className="field"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="e.g. A dialogue between past and present"
            />
          </Field>

          {/* Summary */}
          <Field label="Short summary" id="summary" error={errors.summary}>
            <textarea
              id="summary"
              rows={2}
              className="field resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-sentence description shown on the rooms listing."
            />
          </Field>

          {/* Description */}
          <Field label="Full description" id="description" error={errors.description}>
            <textarea
              id="description"
              rows={4}
              className="field resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed prose shown on the room detail page."
            />
          </Field>

          {/* Size / bed / view — inline row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Field label="Size label" id="sizeLabel" error={errors.sizeLabel}>
              <input
                id="sizeLabel"
                className="field"
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                placeholder="e.g. 46–52 m²"
              />
            </Field>
            <Field label="Bed type" id="bed" error={errors.bed}>
              <input
                id="bed"
                className="field"
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                placeholder="e.g. King bed"
              />
            </Field>
            <Field label="View" id="view" error={errors.view}>
              <input
                id="view"
                className="field"
                value={view}
                onChange={(e) => setView(e.target.value)}
                placeholder="e.g. Historic rooftops"
              />
            </Field>
          </div>

          {/* Max guests */}
          <Field label="Max guests" id="maxGuests" error={errors.maxGuests}>
            <input
              id="maxGuests"
              type="number"
              min={1}
              max={20}
              className="field w-24"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
            />
          </Field>

          {/* Amenities */}
          <Field
            label="Amenities (one per line)"
            id="amenities"
            error={errors.amenities}
          >
            <textarea
              id="amenities"
              rows={5}
              className="field resize-y font-sans text-[0.82rem]"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder={"Walk-in rainfall shower\nItalian linen and pillow menu\nCurated minibar and tea service"}
            />
          </Field>

          {/* Image Upload */}
          <Field label="Room Images" id="images" error={errors.imageUrls}>
            <div className="flex flex-col gap-4">
              {/* Thumbnail grid */}
              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url) => (
                    <div
                      key={url}
                      className="group relative h-20 w-24 overflow-hidden rounded border border-flora-line bg-flora-cream"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Room image"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(url)}
                        className="absolute inset-0 flex items-center justify-center bg-flora-espresso/60 opacity-0 transition-opacity group-hover:opacity-100"
                        title="Remove image"
                      >
                        <span className="font-sans text-[0.65rem] font-medium uppercase tracking-wider text-flora-ivory">
                          Remove
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload control */}
              <div>
                <label className={`luxury-button inline-flex cursor-pointer border-flora-line text-flora-grey [--button-fill:var(--flora-sage)] [--button-ink:var(--flora-navy)] ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <span>{uploading ? "Uploading…" : "+ Add images"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
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
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create room type"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/room-types")}
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

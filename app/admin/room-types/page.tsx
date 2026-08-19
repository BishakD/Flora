"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import type { RoomType } from "@/types/database";

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
          This will permanently remove the room type and cannot be undone.
          Bookings referencing this room will be affected.
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

export default function RoomTypesPage() {
  useAdminSession();

  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("room_types")
      .select("*")
      .order("created_at", { ascending: true });
    setRooms((data as RoomType[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("room_types").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    fetchRooms();
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

      <AdminShell title="Room Types">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="font-sans text-[0.78rem] text-flora-grey">
            {loading
              ? "Loading…"
              : `${rooms.length} room type${rooms.length !== 1 ? "s" : ""}`}
          </p>
          <Link
            href="/admin/room-types/new"
            className="luxury-button border-flora-navy bg-flora-navy text-flora-ivory [--button-fill:var(--flora-slate)] [--button-ink:var(--flora-ivory-card)]"
          >
            + Add room type
          </Link>
        </div>

        {!loading && rooms.length === 0 && (
          <p className="py-16 text-center font-sans text-sm text-flora-grey">
            No room types yet.{" "}
            <Link href="/admin/room-types/new" className="underline">
              Add one.
            </Link>
          </p>
        )}

        {rooms.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-flora-line bg-flora-ivory shadow-soft">
            <table className="w-full border-collapse font-sans text-[0.8rem] text-flora-charcoal">
              <thead>
                <tr className="border-b border-flora-line bg-flora-cream/60 text-left">
                  {[
                    "Thumbnail",
                    "Name",
                    "Eyebrow",
                    "Size",
                    "Max guests",
                    "Amenities",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className={`whitespace-nowrap px-4 py-3 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em] text-flora-grey ${col === "Actions" ? "text-right" : ""}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, i) => (
                  <tr
                    key={room.id}
                    className={`border-b border-flora-line/60 transition-colors duration-150 hover:bg-flora-cream/40 ${
                      i % 2 === 0 ? "" : "bg-flora-cream/20"
                    }`}
                  >
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      {room.image_urls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={room.image_urls[0]}
                          alt={room.name}
                          className="h-12 w-16 rounded object-cover"
                        />
                      ) : (
                        <span className="inline-block h-12 w-16 rounded bg-flora-cream" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{room.name}</td>
                    <td className="px-4 py-3 text-flora-grey">
                      {room.eyebrow}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-flora-grey">
                      {room.size_label}
                    </td>
                    <td className="px-4 py-3 text-center">{room.max_guests}</td>
                    <td className="px-4 py-3 text-center">
                      {room.amenities?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/room-types/${room.id}/edit`}
                          className="luxury-button border-flora-blue text-flora-slate [--button-fill:var(--flora-blue)] [--button-ink:var(--flora-ivory-card)] p-2"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(room)}
                          className="luxury-button border-flora-rose text-flora-terracotta [--button-fill:var(--flora-blush)] [--button-ink:var(--flora-espresso)] p-2"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
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

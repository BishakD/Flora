"use client";

import { useState, useTransition, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import type { Staff } from "@/types/database";

// ─── Delete confirm modal ────────────────────────────────────────────────────
function DeleteStaffModal({
  email,
  onConfirm,
  onCancel,
  busy,
}: {
  email: string;
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
          Delete &ldquo;{email}&rdquo;?
        </h2>
        <p className="mt-3 font-sans text-[0.82rem] text-flora-grey font-medium text-flora-terracotta">
          This change is unchangeable and permanent.
        </p>
        <p className="mt-2 font-sans text-[0.82rem] text-flora-grey">
          This staff member will immediately lose access to the admin and reception panels.
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

type FormState = "idle" | "success" | "error";

export default function AdminStaffPage() {
  useAdminSession();

  // ── Add staff form state ──────────────────────────────────────────────────
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // ── Staff list state ──────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load existing staff — called once we have a confirmed session token
  async function loadStaff(accessToken: string) {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/admin/create-staff", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setListError(json.error ?? "Could not load staff list.");
      } else {
        setStaffList((json.staff ?? []) as Staff[]);
      }
    } catch {
      setListError("Could not load staff list.");
    } finally {
      setListLoading(false);
    }
  }

  // Wait for auth state to fully restore before calling the API
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          loadStaff(session.access_token);
        }
      }
    );
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Form submit ───────────────────────────────────────────────────────────
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("idle");
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const form = event.currentTarget;

    startTransition(async () => {
      // Use getUser() to get a fresh, validated token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFormError("Your session has expired. Please log in again.");
        setFormState("error");
        return;
      }

      const response = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, password, role }),
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        setFormError(json.error ?? "An unexpected error occurred.");
        setFormState("error");
      } else {
        setFormState("success");
        form.reset();
        // Refresh staff list with fresh token
        await loadStaff(session.access_token);
      }
    });
  }

  // ── Remove Staff ──────────────────────────────────────────────────────────
  async function handleRemoveStaff() {
    if (!deleteTarget) return;

    setDeleting(true);
    setListError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setListError("Your session has expired. Please log in again.");
        setDeleting(false);
        setDeleteTarget(null);
        return;
      }

      const res = await fetch(`/api/admin/create-staff?id=${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setListError(json.error ?? "Failed to delete staff member.");
        alert(json.error ?? "Failed to delete staff member.");
      } else {
        // Refresh list
        await loadStaff(session.access_token);
      }
    } catch {
      setListError("An unexpected error occurred while deleting.");
      alert("An unexpected error occurred while deleting.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <AdminShell title="Staff Management" eyebrow="Flora · Firenze">
      {deleteTarget && (
        <DeleteStaffModal
          email={deleteTarget.email}
          onConfirm={handleRemoveStaff}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
      
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

        {/* ── Add Staff Form ──────────────────────────────────────────────── */}
        <div className="rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-lift h-fit">
          <p className="eyebrow text-flora-gold">Admin Panel</p>
          <h2 className="display-title mt-1 text-[1.3rem] text-flora-navy">Add Staff Member</h2>
          <p className="mt-1 font-sans text-[0.78rem] text-flora-grey leading-relaxed">
            Creates a new staff login. The account is immediately active — no email verification needed.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="staff-email" className="eyebrow text-flora-grey">
                Email Address
              </label>
              <input
                id="staff-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                className="field text-flora-charcoal"
                placeholder="staff@florafirenze.com"
                suppressHydrationWarning
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="staff-password" className="eyebrow text-flora-grey">
                Temporary Password
              </label>
              <input
                id="staff-password"
                name="password"
                type="password"
                required
                suppressHydrationWarning
                minLength={8}
                autoComplete="new-password"
                className="field text-flora-charcoal"
                placeholder="••••••••"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="staff-role" className="eyebrow text-flora-grey">
                Role
              </label>
              <select id="staff-role" name="role" required className="field text-flora-charcoal appearance-none bg-white">
                <option value="reception">Reception</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Feedback */}
            {formState === "success" && (
              <p role="alert" className="rounded border border-flora-sage bg-flora-cream px-3 py-2 font-sans text-[0.78rem] text-flora-sage-dark">
                ✓ Staff account created successfully
              </p>
            )}
            {formState === "error" && formError && (
              <p role="alert" className="rounded border border-flora-rose bg-flora-blush px-3 py-2 font-sans text-[0.78rem] text-flora-terracotta">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="luxury-button mt-1 w-full border-flora-navy bg-flora-navy text-flora-ivory [--button-fill:var(--flora-slate-blue-deep)] [--button-ink:var(--flora-ivory-card)] disabled:opacity-60"
            >
              {isPending ? "Creating…" : "Create Staff Member"}
            </button>
          </form>
        </div>

        {/* ── Staff List ──────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-lift h-fit">
          <p className="eyebrow text-flora-gold">Current Team</p>
          <h2 className="display-title mt-1 text-[1.3rem] text-flora-navy">Staff Accounts</h2>

          {listLoading && (
            <p className="mt-6 font-sans text-[0.82rem] text-flora-grey">Loading…</p>
          )}

          {listError && (
            <p role="alert" className="mt-4 font-sans text-[0.82rem] text-flora-terracotta">{listError}</p>
          )}

          {!listLoading && !listError && staffList.length === 0 && (
            <p className="mt-6 font-sans text-[0.82rem] text-flora-grey">
              No staff members found. Add one using the form.
            </p>
          )}

          {!listLoading && staffList.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full font-sans text-[0.8rem]">
                <thead>
                  <tr className="border-b border-flora-line text-left">
                    <th className="pb-2 font-medium uppercase tracking-[0.12em] text-flora-grey text-[0.62rem]">Email</th>
                    <th className="pb-2 font-medium uppercase tracking-[0.12em] text-flora-grey text-[0.62rem]">Role</th>
                    <th className="pb-2 font-medium uppercase tracking-[0.12em] text-flora-grey text-[0.62rem]">Added</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((member) => (
                    <tr key={member.id} className="border-b border-flora-line/50 hover:bg-flora-cream/40 transition-colors group">
                      <td className="py-3 pr-4 text-flora-charcoal">{member.email}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.1em] border ${
                            member.role === "admin"
                              ? "bg-flora-navy/10 text-flora-navy border-flora-navy/20"
                              : "bg-flora-sage/30 text-flora-navy border-flora-sage"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 text-flora-grey">
                        {new Date(member.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-flora-grey hover:text-flora-terracotta rounded hover:bg-flora-blush"
                          title="Remove staff member"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

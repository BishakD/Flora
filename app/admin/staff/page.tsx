"use client";

import { useState, useTransition, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import type { Staff } from "@/types/database";

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

  // Load existing staff on mount
  async function loadStaff() {
    setListLoading(true);
    setListError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setListLoading(false);
        return;
      }

      const res = await fetch("/api/admin/create-staff", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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

  useEffect(() => {
    loadStaff();
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
      // Get the current session token to authenticate the API call
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
        // Refresh the staff list
        await loadStaff();
      }
    });
  }

  return (
    <AdminShell title="Staff Management" eyebrow="Flora · Firenze">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

        {/* ── Add Staff Form ──────────────────────────────────────────────── */}
        <div className="rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-lift">
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
                minLength={8}
                autoComplete="new-password"
                className="field text-flora-charcoal"
                placeholder="Min. 8 characters"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="staff-role" className="eyebrow text-flora-grey">
                Role
              </label>
              <select
                id="staff-role"
                name="role"
                required
                defaultValue="reception"
                className="field text-flora-charcoal"
              >
                <option value="reception">Reception</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Feedback */}
            {formState === "success" && (
              <p role="status" className="rounded border border-flora-sage bg-flora-sage/20 px-3 py-2 font-sans text-[0.78rem] text-flora-navy">
                ✓ Staff account created successfully.
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
        <div className="rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-lift">
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
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((member) => (
                    <tr key={member.id} className="border-b border-flora-line/50 hover:bg-flora-cream/40 transition-colors">
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

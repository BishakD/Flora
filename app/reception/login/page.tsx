"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReceptionLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError || !data.session) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      // Check the user's role securely via the API
      let role = null;
      try {
        const res = await fetch("/api/staff/me", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const json = await res.json();
        if (res.ok && json.role) {
          role = json.role;
        }
      } catch (err) {
        console.error("Error checking role:", err);
      }

      if (!role) {
        // Signed in to Supabase Auth but not a staff member (or API failed).
        // We do NOT sign them out here, to avoid destroying sessions across other tabs/apps.
        setError("Access denied — this account has no staff role assigned.");
        return;
      }

      if (role === "admin") {
        // Admin users are redirected to the full admin panel
        router.push("/admin");
        router.refresh();
        return;
      }

      if (role === "reception") {
        router.push("/reception");
        router.refresh();
        return;
      }

      // Unknown role
      setError("Access denied — unknown role.");
    });
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-flora-cream px-6 pt-[var(--nav-height)]"
    >
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <p className="eyebrow text-flora-gold">Flora · Firenze</p>
          <h1 className="display-title mt-2 text-[2.4rem] text-flora-navy">
            Reception
          </h1>
          <p className="mt-2 font-sans text-[0.78rem] text-flora-grey">
            Staff portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-7"
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="eyebrow text-flora-grey">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field text-flora-charcoal"
              placeholder="staff@florafirenze.com"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="eyebrow text-flora-grey">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="field text-flora-charcoal"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="text-center font-sans text-[0.78rem] text-flora-terracotta"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="luxury-button mt-2 w-full border-flora-navy bg-flora-navy text-flora-ivory [--button-fill:var(--flora-slate-blue-deep)] [--button-ink:var(--flora-ivory-card)] disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

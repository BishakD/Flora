"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
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
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/admin");
        router.refresh();
      }
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
            Admin
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="eyebrow text-flora-grey"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field text-flora-charcoal"
              placeholder="admin@example.com"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="eyebrow text-flora-grey"
            >
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

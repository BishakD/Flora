"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import { RatePlanForm } from "@/app/admin/_components/RatePlanForm";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import type { RatePlan } from "@/types/database";

export default function EditRatePlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  useAdminSession();

  const [plan, setPlan] = useState<RatePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then(async ({ id }) => {
      const { data } = await supabase
        .from("rate_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        setNotFound(true);
      } else {
        setPlan(data as RatePlan);
      }
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <AdminShell title="Edit Rate Plan">
        <div className="flex py-32 items-center justify-center">
          <p className="eyebrow text-flora-grey">Loading…</p>
        </div>
      </AdminShell>
    );
  }

  if (notFound) {
    return (
      <AdminShell title="Edit Rate Plan">
        <p className="py-16 text-center font-sans text-sm text-flora-terracotta">
          Rate plan not found.
        </p>
      </AdminShell>
    );
  }

  return <RatePlanForm initial={plan!} />;
}

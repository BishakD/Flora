"use client";

import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import { RatePlanForm } from "@/app/admin/_components/RatePlanForm";

export default function NewRatePlanPage() {
  useAdminSession();
  return <RatePlanForm />;
}

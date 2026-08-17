"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import { RoomTypeForm } from "@/app/admin/_components/RoomTypeForm";
import { AdminShell } from "@/app/admin/_components/AdminShell";
import type { RoomType } from "@/types/database";

export default function EditRoomTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  useAdminSession();

  const router = useRouter();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then(async ({ id }) => {
      const { data } = await supabase
        .from("room_types")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        setNotFound(true);
      } else {
        setRoom(data as RoomType);
      }
      setLoading(false);
    });
  }, [params, router]);

  if (loading) {
    return (
      <AdminShell title="Edit Room Type">
        <div className="flex py-32 items-center justify-center">
          <p className="eyebrow text-flora-grey">Loading…</p>
        </div>
      </AdminShell>
    );
  }

  if (notFound) {
    return (
      <AdminShell title="Edit Room Type">
        <p className="py-16 text-center font-sans text-sm text-flora-terracotta">
          Room type not found.
        </p>
      </AdminShell>
    );
  }

  return <RoomTypeForm initial={room!} />;
}

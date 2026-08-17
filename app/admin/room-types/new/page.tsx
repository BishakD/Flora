"use client";

import { useAdminSession } from "@/app/admin/_lib/useAdminSession";
import { RoomTypeForm } from "@/app/admin/_components/RoomTypeForm";

export default function NewRoomTypePage() {
  useAdminSession();
  return <RoomTypeForm />;
}

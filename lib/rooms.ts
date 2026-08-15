import { cache } from "react";
import { roomFromDatabase, type Room } from "@/data/rooms";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { RoomTypeWithRatePlans } from "@/types/database";

const roomDisplayOrder = ["charming-room", "heritage-suite", "majestic-suite", "deluxe-double"];

function byDisplayOrder(a: Room, b: Room) {
  const aIndex = roomDisplayOrder.indexOf(a.slug);
  const bIndex = roomDisplayOrder.indexOf(b.slug);
  return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
}

export const getRooms = cache(async (): Promise<Room[]> => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("room_types")
    .select("*, rate_plans(*)");

  if (error) {
    console.error("Unable to load Flora room types from Supabase:", error.message);
    return [];
  }

  return (data as RoomTypeWithRatePlans[]).map(roomFromDatabase).sort(byDisplayOrder);
});

export const getRoomBySlug = cache(async (slug: string): Promise<Room | null> => {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("room_types")
    .select("*, rate_plans(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Unable to load Flora room "${slug}" from Supabase:`, error.message);
    return null;
  }

  return data ? roomFromDatabase(data as RoomTypeWithRatePlans) : null;
});

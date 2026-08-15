import type { RoomTypeWithRatePlans } from "@/types/database";

export type RoomRate = {
  id: string;
  name: string;
  policy: string;
  note: string;
  price: number;
  currency: string;
};

export type Room = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  description: string;
  size: string;
  occupancy: string;
  maxGuests: number;
  bed: string;
  view: string;
  images: string[];
  amenities: string[];
  rates: RoomRate[];
};

export function roomFromDatabase(room: RoomTypeWithRatePlans): Room {
  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    eyebrow: room.eyebrow,
    summary: room.summary,
    description: room.description,
    size: room.size_label,
    occupancy: `${room.max_guests} ${room.max_guests === 1 ? "guest" : "guests"}`,
    maxGuests: room.max_guests,
    bed: room.bed,
    view: room.view,
    images: room.image_urls,
    amenities: room.amenities,
    rates: [...room.rate_plans]
      .sort((a, b) => b.price_per_night - a.price_per_night)
      .map((rate) => ({
        id: rate.id,
        name: rate.name,
        policy: rate.cancellation_policy,
        note: rate.booking_note,
        price: rate.price_per_night,
        currency: rate.currency,
      })),
  };
}

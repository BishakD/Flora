export type ISODate = string;
export type ISODateTime = string;
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface RoomType {
  id: string;
  name: string;
  slug: string;
  eyebrow: string;
  summary: string;
  description: string;
  size_label: string;
  max_guests: number;
  bed: string;
  view: string;
  amenities: string[];
  image_urls: string[];
  created_at: ISODateTime;
}

export interface RatePlan {
  id: string;
  room_type_id: string;
  name: string;
  price_per_night: number;
  currency: string;
  cancellation_policy: string;
  booking_note: string;
  created_at: ISODateTime;
}

export interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_type_id: string;
  rate_plan_id: string;
  check_in: ISODate;
  check_out: ISODate;
  adults: number;
  children: number;
  children_ages: number[];
  total_price: number;
  status: BookingStatus;
  created_at: ISODateTime;
}

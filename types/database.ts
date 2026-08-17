export type ISODate = string;
export type ISODateTime = string;
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "awaiting_payment" | "deposit_paid" | "refunded" | "refund_failed";

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
  deposit_amount?: number | null;
  payment_status?: PaymentStatus | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  status: BookingStatus;
  created_at: ISODateTime;
}
export interface RoomTypeWithRatePlans extends RoomType {
  rate_plans: RatePlan[];
}

export type BookingCreate = Pick<
  Booking,
  | "guest_name"
  | "guest_email"
  | "guest_phone"
  | "room_type_id"
  | "rate_plan_id"
  | "check_in"
  | "check_out"
  | "adults"
  | "children"
  | "children_ages"
  | "total_price"
>;

type RoomTypeInsert = Omit<RoomType, "id" | "created_at"> & { id?: string; created_at?: ISODateTime };
type RatePlanInsert = Omit<RatePlan, "id" | "created_at" | "currency"> & { id?: string; created_at?: ISODateTime; currency?: string };
type BookingInsert = Omit<Booking, "id" | "created_at" | "status"> & { id?: string; created_at?: ISODateTime; status?: BookingStatus };

export interface Database {
  public: {
    Tables: {
      room_types: {
        Row: RoomType & Record<string, unknown>;
        Insert: RoomTypeInsert & Record<string, unknown>;
        Update: Partial<RoomTypeInsert> & Record<string, unknown>;
        Relationships: [];
      };
      rate_plans: {
        Row: RatePlan & Record<string, unknown>;
        Insert: RatePlanInsert & Record<string, unknown>;
        Update: Partial<RatePlanInsert> & Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: "rate_plans_room_type_id_fkey";
            columns: ["room_type_id"];
            isOneToOne: false;
            referencedRelation: "room_types";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: Booking & Record<string, unknown>;
        Insert: BookingInsert & Record<string, unknown>;
        Update: Partial<BookingInsert> & Record<string, unknown>;
        Relationships: [
          {
            foreignKeyName: "bookings_room_type_id_fkey";
            columns: ["room_type_id"];
            isOneToOne: false;
            referencedRelation: "room_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_rate_plan_id_fkey";
            columns: ["rate_plan_id"];
            isOneToOne: false;
            referencedRelation: "rate_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_room_availability: {
        Args: {
          p_room_type_id: string;
          p_check_in: ISODate;
          p_check_out: ISODate;
        };
        Returns: boolean;
      };
      get_booking_for_payment: {
        Args: {
          p_booking_id: string;
        };
        Returns: {
          id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          check_in: string;
          check_out: string;
          adults: number;
          children: number;
          total_price: number;
          deposit_amount: number | null;
          payment_status: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: string;
          room_types: {
            name: string;
            summary?: string;
            image_urls?: string[];
          } | null;
          rate_plans: {
            name: string;
            currency?: string;
          } | null;
        } | null;
      };
      record_deposit_paid: {
        Args: {
          p_booking_id: string;
          p_razorpay_payment_id?: string | null;
        };
        Returns: {
          id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          check_in: string;
          check_out: string;
          adults: number;
          children: number;
          total_price: number;
          deposit_amount: number | null;
          payment_status: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: string;
          room_types: {
            name: string;
            summary?: string;
            image_urls?: string[];
          } | null;
          rate_plans: {
            name: string;
            currency?: string;
          } | null;
        } | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

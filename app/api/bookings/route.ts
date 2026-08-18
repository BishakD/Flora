import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { BookingCreate } from "@/types/database";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingCreate & { id?: string };

    const {
      guest_name,
      guest_email,
      guest_phone,
      room_type_id,
      rate_plan_id,
      check_in,
      check_out,
      adults,
      children = 0,
      children_ages = [],
      total_price,
    } = body;

    if (
      !guest_name ||
      !guest_email ||
      !guest_phone ||
      !room_type_id ||
      !rate_plan_id ||
      !check_in ||
      !check_out
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 },
      );
    }

    // 1. Verify availability
    const { data: available, error: availabilityError } = await supabase.rpc(
      "check_room_availability",
      {
        p_room_type_id: room_type_id,
        p_check_in: check_in,
        p_check_out: check_out,
      },
    );

    if (availabilityError) {
      console.error("[Booking API] Availability check error:", availabilityError);
      return NextResponse.json(
        { error: "We could not verify availability right now. Please try again." },
        { status: 500 },
      );
    }

    if (!available) {
      return NextResponse.json(
        { error: "This room is no longer available for the selected dates." },
        { status: 409 },
      );
    }

    // 2. Fetch room name and rate plan name for email & response
    const [{ data: roomData }, { data: rateData }] = await Promise.all([
      supabase.from("room_types").select("name").eq("id", room_type_id).maybeSingle(),
      supabase
        .from("rate_plans")
        .select("name, currency")
        .eq("id", rate_plan_id)
        .maybeSingle(),
    ]);

    const bookingId = body.id || crypto.randomUUID();

    // 3. Insert into Supabase bookings table (matching anon column grant)
    const { error: insertError } = await supabase.from("bookings").insert({
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim(),
      guest_phone: guest_phone.trim(),
      room_type_id,
      rate_plan_id,
      check_in,
      check_out,
      adults,
      children,
      children_ages,
      total_price,
    });

    if (insertError) {
      console.error("[Booking API] Insert error:", insertError);
      return NextResponse.json(
        { error: "Your reservation request could not be saved. Please try again." },
        { status: 500 },
      );
    }

    const roomName = roomData?.name || "Flora Suite";
    const rateName = rateData?.name || "Standard Rate";
    const currency = rateData?.currency || "INR";

    return NextResponse.json(
      {
        success: true,
        booking: {
          guestName: guest_name.trim(),
          roomName,
          rateName,
          checkIn: check_in,
          checkOut: check_out,
          adults,
          children,
          totalPrice: total_price,
          currency,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[Booking API] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your reservation." },
      { status: 500 },
    );
  }
}

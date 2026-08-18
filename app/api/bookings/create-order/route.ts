import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createRazorpayOrder } from "@/lib/razorpay";
import type { BookingCreate } from "@/types/database";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingCreate;

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

    // 1. Validate required fields
    if (
      !guest_name ||
      !guest_email ||
      !guest_phone ||
      !room_type_id ||
      !rate_plan_id ||
      !check_in ||
      !check_out ||
      typeof total_price !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 },
      );
    }

    // 2. Availability check — first gate
    const { data: available, error: availabilityError } = await supabase.rpc(
      "check_room_availability",
      {
        p_room_type_id: room_type_id,
        p_check_in: check_in,
        p_check_out: check_out,
      },
    );

    if (availabilityError) {
      console.error("[CreateOrder] Availability check error:", availabilityError);
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

    // 3. Compute deposit amount
    const depositAmount = Math.round(total_price * 0.25 * 100) / 100;
    const depositInPaise = Math.round(depositAmount * 100);

    let bookingId: string | null = null;
    let bookingReference: string | null = null;

    // 4. Try Security-Definer RPC 'create_guest_booking' first (bypasses RLS SELECT restrictions)
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_guest_booking", {
      p_guest_name: guest_name.trim(),
      p_guest_email: guest_email.trim(),
      p_guest_phone: guest_phone.trim(),
      p_room_type_id: room_type_id,
      p_rate_plan_id: rate_plan_id,
      p_check_in: check_in,
      p_check_out: check_out,
      p_adults: adults,
      p_children: children,
      p_children_ages: children_ages,
      p_total_price: total_price,
    });

    if (!rpcError && rpcData?.id) {
      bookingId = rpcData.id as string;
      bookingReference = (rpcData.booking_reference as string) ?? null;
      console.log(`[CreateOrder] Booking created via RPC: ${bookingId} ref: ${bookingReference}`);
    } else {
      if (rpcError) {
        console.warn("[CreateOrder] RPC create_guest_booking not available or failed:", rpcError.message);
      }

      // Fallback: Direct table insertion
      const { data: insertedRows, error: insertError } = await supabase
        .from("bookings")
        .insert({
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
          deposit_amount: depositAmount,
          status: "confirmed",
          payment_status: "awaiting_payment",
        })
        .select("id, booking_reference")
        .single();

      if (insertError || !insertedRows?.id) {
        console.error("[CreateOrder] Insert error:", insertError);
        return NextResponse.json(
          {
            error:
              "Could not save your reservation. Please run the SQL patch in Supabase or contact support.",
            details: insertError?.message,
            hint: insertError?.hint,
          },
          { status: 500 },
        );
      }

      bookingId = insertedRows.id as string;
      bookingReference = (insertedRows as any).booking_reference as string | null;
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: "Could not create reservation record. Please try again." },
        { status: 500 },
      );
    }

    // 5. Create Razorpay order
    let razorpayOrderId: string | null = null;
    try {
      const order = await createRazorpayOrder({
        amountInPaise: depositInPaise,
        receipt: bookingId.slice(0, 40),
        notes: {
          booking_id: bookingId,
          guest_name: guest_name.trim(),
          guest_email: guest_email.trim(),
        },
      });
      razorpayOrderId = order.id;
      console.log(`[CreateOrder] Razorpay order created: ${razorpayOrderId} for booking ${bookingId}`);
    } catch (orderErr: any) {
      console.error("[CreateOrder] Razorpay order creation failed:", orderErr?.message || orderErr);
      // Clean up orphaned booking row
      await supabase.from("bookings").delete().eq("id", bookingId);
      return NextResponse.json(
        { error: "Payment gateway is unavailable. Please try again in a moment." },
        { status: 502 },
      );
    }

    // 6. Update booking with razorpay_order_id
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        razorpay_order_id: razorpayOrderId,
      } as any)
      .eq("id", bookingId);

    if (updateError) {
      console.warn("[CreateOrder] Update razorpay_order_id warning:", updateError.message);
    }

    return NextResponse.json(
      {
        success: true,
        bookingId,
        bookingReference,
        razorpayOrderId,
        depositAmount,
        depositInPaise,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("[CreateOrder] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { createRazorpayOrder } from "@/lib/razorpay";
import type { BookingStatus, Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status: BookingStatus };
    const { status: nextStatus } = body;

    console.log(`[Admin Status API] Request received for booking ${id} -> status: ${nextStatus}`);

    if (!id || !nextStatus) {
      return NextResponse.json(
        { error: "Missing required booking id or status" },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("Authorization");
    const clientOptions = authHeader
      ? { global: { headers: { Authorization: authHeader } } }
      : undefined;

    const supabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      clientOptions,
    );

    // 1. Fetch current booking state before update
    const { data: booking, error: fetchError } = await supabaseClient
      .from("bookings")
      .select("*, room_types(name), rate_plans!bookings_rate_plan_id_fkey(name, currency)")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !booking) {
      console.error("[Admin Status API] Booking not found or fetch error:", JSON.stringify(fetchError, null, 2));
      return NextResponse.json(
        {
          error: fetchError?.message || "Booking not found",
          code: fetchError?.code,
          details: fetchError?.details,
          hint: fetchError?.hint,
        },
        { status: fetchError ? 500 : 404 },
      );
    }

    const previousStatus = booking.status;
    console.log(`[Admin Status API] Current booking status: ${previousStatus}`);

    // 2. Handle pending -> confirmed transition with 25% Razorpay deposit order
    if (previousStatus === "pending" && nextStatus === "confirmed") {
      const totalPrice = Number(booking.total_price);
      const depositAmount = Math.round(totalPrice * 0.25 * 100) / 100;
      const remainingBalance = Math.max(0, Math.round((totalPrice - depositAmount) * 100) / 100);
      const depositInPaise = Math.round(depositAmount * 100);

      let razorpayOrderId: string | null = null;

      try {
        console.log(`[Admin Status API] Creating Razorpay order for deposit: ₹${depositAmount} (${depositInPaise} paise)...`);
        const order = await createRazorpayOrder({
          amountInPaise: depositInPaise,
          receipt: id,
          notes: {
            booking_id: id,
            guest_name: booking.guest_name,
            guest_email: booking.guest_email,
          },
        });
        razorpayOrderId = order.id;
        console.log(`[Admin Status API] Razorpay order created successfully: ${razorpayOrderId}`);
      } catch (orderErr: any) {
        console.error("[Admin Status API] Razorpay order creation failed:", orderErr?.message || orderErr);
        // We log and continue so we know the exact error
      }

      console.log(`[Admin Status API] Updating booking row in Supabase...`);
      // Update booking with status confirmed, deposit_amount, payment_status, razorpay_order_id
      const { error: updateError } = await supabaseClient
        .from("bookings")
        .update({
          status: "confirmed",
          deposit_amount: depositAmount,
          payment_status: "awaiting_payment",
          razorpay_order_id: razorpayOrderId,
        } as any)
        .eq("id", id);

      if (updateError) {
        console.error("[Admin Status API] Supabase update error:", JSON.stringify(updateError, null, 2));
        return NextResponse.json(
          {
            error: updateError.message || "Failed to update booking status",
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
            source: "supabase_update",
          },
          { status: 500 },
        );
      }

      // Determine base payment URL (prioritizes NEXT_PUBLIC_SITE_URL in production)
      const origin = request.headers.get("origin") || request.headers.get("referer") || "";
      let baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "";

      if (!baseUrl) {
        try {
          if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
          } else if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
          } else if (origin) {
            baseUrl = new URL(origin).origin;
          }
        } catch {
          baseUrl = "http://localhost:3000";
        }
      }

      if (!baseUrl) {
        baseUrl = "http://localhost:3000";
      }

      baseUrl = baseUrl.replace(/\/+$/, "");
      const paymentUrl = `${baseUrl}/pay/${id}`;

      // Send "Booking Confirmed" email with deposit payment button
      try {
        const roomName = booking.room_types?.name || "Flora Room";
        const rateName = booking.rate_plans?.name || "Standard Rate";
        const currency = booking.rate_plans?.currency || "INR";

        await sendBookingConfirmedEmail({
          bookingId: id,
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          roomName,
          rateName,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          adults: booking.adults,
          children: booking.children,
          totalPrice,
          currency,
          depositAmount,
          remainingBalance,
          paymentUrl,
        });
      } catch (emailErr: any) {
        console.error("[Admin Status API] Failed to send confirmed email:", emailErr?.message || emailErr);
      }

      return NextResponse.json({
        success: true,
        status: "confirmed",
        deposit_amount: depositAmount,
        payment_status: "awaiting_payment",
        razorpay_order_id: razorpayOrderId,
      });
    }

    // 3. Other status updates (e.g. cancelled)
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ status: nextStatus } as any)
      .eq("id", id);

    if (updateError) {
      console.error("[Admin Status API] Supabase update error (other status):", JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        {
          error: updateError.message || "Failed to update booking status",
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
          source: "supabase_update",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err: any) {
    console.error("[Admin Status API] Unexpected exception:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 },
    );
  }
}

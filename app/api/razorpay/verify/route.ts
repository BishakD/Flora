import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRazorpayPaymentSignature, createRazorpayRefund } from "@/lib/razorpay";
import { sendBookingConfirmedEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 },
      );
    }

    // 1. Verify HMAC signature — must pass before we touch the database
    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.error("[Razorpay Verify] Invalid signature for booking:", bookingId);
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // 2. Fetch current booking state to get dates + room for re-check
    const { data: bookingData, error: fetchError } = await supabase.rpc(
      "get_booking_for_payment",
      { p_booking_id: bookingId },
    );

    if (fetchError || !bookingData) {
      console.error("[Razorpay Verify] Booking not found:", bookingId, fetchError);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    // 3. Idempotency — if already marked deposit_paid, return success immediately
    if (bookingData.payment_status === "deposit_paid") {
      console.log(`[Razorpay Verify] Booking ${bookingId} already marked deposit_paid — idempotent`);
      return NextResponse.json({ success: true, payment_status: "deposit_paid" });
    }

    // 4. Race-condition availability re-check
    //    Verify no OTHER booking (excluding this one) was paid & confirmed for these dates
    let roomTypeId: string | null = null;
    {
      const { data: rawBooking } = await supabase
        .from("bookings")
        .select("room_type_id")
        .eq("id", bookingId)
        .maybeSingle();
      roomTypeId = rawBooking?.room_type_id ?? null;
    }

    if (roomTypeId) {
      const { data: conflicts, error: conflictError } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_type_id", roomTypeId)
        .neq("id", bookingId)
        .eq("status", "confirmed")
        .eq("payment_status", "deposit_paid")
        .lt("check_in", bookingData.check_out)
        .gt("check_out", bookingData.check_in)
        .limit(1);

      if (!conflictError && conflicts && conflicts.length > 0) {
        // Room is truly taken by another paid booking — auto-refund and cancel this booking
        console.warn(`[Razorpay Verify] Race condition — room booked by another guest for booking ${bookingId}. Initiating refund.`);

        const depositAmount = Number(bookingData.deposit_amount) || Math.round(Number(bookingData.total_price) * 0.25 * 100) / 100;
        const refundInPaise = Math.round(depositAmount * 100);

        try {
          await createRazorpayRefund({
            paymentId: razorpay_payment_id,
            amountInPaise: refundInPaise,
            notes: {
              booking_id: bookingId,
              reason: "Room unavailable at payment time — automatic refund",
            },
          });
          console.log(`[Razorpay Verify] Auto-refund issued for booking ${bookingId}`);
        } catch (refundErr: any) {
          console.error("[Razorpay Verify] Auto-refund failed:", refundErr?.message);
        }

        // Mark booking as cancelled + refunded
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
            payment_status: "refunded",
            razorpay_payment_id,
          } as any)
          .eq("id", bookingId);

        return NextResponse.json(
          {
            success: false,
            roomUnavailable: true,
            error:
              "Unfortunately this room was just booked by another guest. Your payment has been automatically refunded and will appear in your account within 5–7 business days.",
          },
          { status: 409 },
        );
      }
    }

    // 5. All clear — mark deposit_paid via security-definer RPC
    const { data: booking, error: updateError } = await supabase.rpc(
      "record_deposit_paid",
      {
        p_booking_id: bookingId,
        p_razorpay_payment_id: razorpay_payment_id,
      },
    );

    if (updateError || !booking) {
      console.error("[Razorpay Verify] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 },
      );
    }

    // 6. Send the single "Booking Confirmed" email — only triggered here, never before payment
    const roomName = booking.room_types?.name || "Flora Room";
    const rateName = booking.rate_plans?.name || "Standard Rate";
    const currency = booking.rate_plans?.currency || "INR";
    const totalPrice = Number(booking.total_price);
    const depositAmount = Number(booking.deposit_amount) || Math.round(totalPrice * 0.25 * 100) / 100;
    const remainingBalance = Math.max(0, Math.round((totalPrice - depositAmount) * 100) / 100);

    try {
      await sendBookingConfirmedEmail({
        bookingId,
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
        razorpayPaymentId: razorpay_payment_id,
      });
    } catch (emailErr) {
      console.error("[Razorpay Verify] Failed to send Booking Confirmed email:", emailErr);
      // Non-fatal — payment is already captured and DB is updated
    }

    return NextResponse.json({ success: true, payment_status: "deposit_paid" });
  } catch (err) {
    console.error("[Razorpay Verify] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 },
    );
  }
}

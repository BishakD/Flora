import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { sendPaymentReceivedEmail } from "@/lib/email";

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

    // 1. Verify signature
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

    // 2. Fetch booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, room_types(name), rate_plans!bookings_rate_plan_id_fkey(name, currency)")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchError || !booking) {
      console.error("[Razorpay Verify] Booking fetch error:", fetchError);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    const previousPaymentStatus = booking.payment_status;

    // 3. Update payment status in database
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "deposit_paid",
        razorpay_payment_id,
      } as any)
      .eq("id", bookingId);

    if (updateError) {
      console.error("[Razorpay Verify] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 },
      );
    }

    // 4. Send "Payment Received" email if status transitioned to deposit_paid
    if (previousPaymentStatus !== "deposit_paid") {
      const roomName = booking.room_types?.name || "Flora Room";
      const rateName = booking.rate_plans?.name || "Standard Rate";
      const currency = booking.rate_plans?.currency || "INR";
      const totalPrice = Number(booking.total_price);
      const depositAmount = Number(booking.deposit_amount) || Math.round(totalPrice * 0.25 * 100) / 100;
      const remainingBalance = Math.max(0, Math.round((totalPrice - depositAmount) * 100) / 100);

      try {
        await sendPaymentReceivedEmail({
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
          depositAmount,
          remainingBalance,
          currency,
          razorpayPaymentId: razorpay_payment_id,
        });
      } catch (emailErr) {
        console.error("[Razorpay Verify] Failed to send Payment Received email:", emailErr);
      }
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

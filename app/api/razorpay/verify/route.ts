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

    // 2. Update payment status safely using security-definer RPC
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

    // 3. Send "Payment Received" email
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

    return NextResponse.json({ success: true, payment_status: "deposit_paid" });
  } catch (err) {
    console.error("[Razorpay Verify] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { sendPaymentReceivedEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

    // 1. Verify Webhook Signature if secret is configured
    if (webhookSecret) {
      const isValid = verifyRazorpayWebhookSignature({
        bodyText: rawBody,
        signature,
        secret: webhookSecret,
      });

      if (!isValid) {
        console.error("[Razorpay Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      console.warn("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set, signature verification bypassed.");
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    // We handle payment.captured (and optionally order.paid)
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const bookingIdFromNotes = paymentEntity?.notes?.booking_id;

      if (!orderId && !bookingIdFromNotes) {
        console.warn("[Razorpay Webhook] No order_id or booking_id in webhook payload");
        return NextResponse.json({ status: "ignored_no_identifiers" });
      }

      // 2. Find matching booking by razorpay_order_id or notes.booking_id
      let query = supabase
        .from("bookings")
        .select("*, room_types(name), rate_plans!bookings_rate_plan_id_fkey(name, currency)");

      if (orderId) {
        query = query.eq("razorpay_order_id", orderId);
      } else if (bookingIdFromNotes) {
        query = query.eq("id", bookingIdFromNotes);
      }

      const { data: booking, error: findError } = await query.maybeSingle();

      if (findError || !booking) {
        console.error("[Razorpay Webhook] Matching booking not found for order:", orderId, findError);
        return NextResponse.json({ status: "booking_not_found" }, { status: 404 });
      }

      // 3. Check if already processed (Idempotency)
      if (booking.payment_status === "deposit_paid") {
        console.log(`[Razorpay Webhook] Booking ${booking.id} already marked as deposit_paid`);
        return NextResponse.json({ status: "already_processed" });
      }

      // 4. Update booking to deposit_paid
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "deposit_paid",
          razorpay_payment_id: paymentId || booking.razorpay_payment_id,
        } as any)
        .eq("id", booking.id);

      if (updateError) {
        console.error("[Razorpay Webhook] Update error:", updateError);
        return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
      }

      // 5. Send "Payment Received" email
      const roomName = booking.room_types?.name || "Flora Room";
      const rateName = booking.rate_plans?.name || "Standard Rate";
      const currency = booking.rate_plans?.currency || "INR";
      const totalPrice = Number(booking.total_price);
      const depositAmount = Number(booking.deposit_amount) || Math.round(totalPrice * 0.25 * 100) / 100;
      const remainingBalance = Math.max(0, Math.round((totalPrice - depositAmount) * 100) / 100);

      try {
        await sendPaymentReceivedEmail({
          bookingId: booking.id,
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
          razorpayPaymentId: paymentId,
        });
        console.log(`[Razorpay Webhook] Sent Payment Received email for booking ${booking.id}`);
      } catch (emailErr) {
        console.error("[Razorpay Webhook] Failed to send payment email:", emailErr);
      }

      return NextResponse.json({ status: "success", booking_id: booking.id });
    }

    return NextResponse.json({ status: "ignored_unhandled_event" });
  } catch (err) {
    console.error("[Razorpay Webhook Error]:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PaymentCard, type BookingForPayment } from "./PaymentCard";

export const metadata: Metadata = {
  title: "Complete Deposit Payment",
  description: "Secure 25% deposit payment for your upcoming stay at Flora Palazzo in Florence.",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  if (!bookingId) {
    notFound();
  }

  // Fetch booking via security-definer RPC (accessible to anon without exposing table)
  console.log(`[PaymentPage] Fetching booking for id: "${bookingId}"`);
  const { data: booking, error } = await supabase.rpc("get_booking_for_payment", {
    p_booking_id: bookingId,
  });

  console.log(`[PaymentPage] RPC result — data: ${JSON.stringify(booking)}, error: ${JSON.stringify(error)}`);

  if (error || !booking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-flora-cream px-6 py-16 text-center">
        <div className="w-full max-w-md rounded-2xl border border-flora-line bg-flora-ivory p-8 shadow-soft">
          <p className="eyebrow text-flora-gold">Flora · Firenze</p>
          <h1 className="display-title mt-2 text-3xl text-flora-navy">
            Reservation Not Found
          </h1>
          <p className="mt-4 text-sm text-flora-grey">
            We were unable to locate the reservation reference &ldquo;{bookingId}&rdquo;. Please verify your booking link or contact reservations.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="luxury-button border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-flora-cream px-4 py-20 sm:px-6"
    >
      <PaymentCard booking={booking as BookingForPayment} />
    </main>
  );
}

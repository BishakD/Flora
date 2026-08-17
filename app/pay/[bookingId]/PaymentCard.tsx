"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";

export type BookingForPayment = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_price: number;
  deposit_amount?: number | null;
  payment_status?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  status: string;
  room_types: { name: string; summary?: string; image_urls?: string[] } | null;
  rate_plans: { name: string; currency?: string } | null;
};

function formatMoney(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(y, m - 1, d, 12);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function PaymentCard({ booking }: { booking: BookingForPayment }) {
  const [paymentStatus, setPaymentStatus] = useState<string>(
    booking.payment_status || (booking.status === "confirmed" ? "awaiting_payment" : "unpaid")
  );
  const [paymentId, setPaymentId] = useState<string>(booking.razorpay_payment_id || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = booking.rate_plans?.currency || "INR";
  const totalPrice = Number(booking.total_price);
  const depositAmount =
    Number(booking.deposit_amount) || Math.round(totalPrice * 0.25 * 100) / 100;
  const remainingBalance = Math.max(0, Math.round((totalPrice - depositAmount) * 100) / 100);

  const roomName = booking.room_types?.name || "Flora Room";
  const rateName = booking.rate_plans?.name || "Standard Rate";

  const handlePayDeposit = () => {
    setError(null);
    setIsProcessing(true);

    if (typeof window === "undefined" || !(window as any).Razorpay) {
      setError("Payment gateway is loading. Please try again in a few seconds.");
      setIsProcessing(false);
      return;
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TQmztQD13s00j1";

    const options = {
      key: keyId,
      amount: Math.round(depositAmount * 100),
      currency: "INR",
      name: "Flora Palazzo",
      description: `25% Deposit · ${roomName}`,
      order_id: booking.razorpay_order_id,
      prefill: {
        name: booking.guest_name,
        email: booking.guest_email,
        contact: booking.guest_phone,
      },
      theme: {
        color: "#1B2A3F",
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setIsProcessing(true);
        try {
          const res = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setPaymentStatus("deposit_paid");
            setPaymentId(response.razorpay_payment_id);
          } else {
            setError(data.error || "Payment verification failed. Please contact our concierge.");
          }
        } catch (err) {
          console.error("Verification error:", err);
          setError("Network error verifying payment. Please refresh the page.");
        } finally {
          setIsProcessing(false);
        }
      },
    };

    try {
      // DIAGNOSTIC: log exact options being passed to Razorpay checkout
      console.log("[RazorpayCheckout] Options passed to new Razorpay():", JSON.stringify({
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
      }, null, 2));
      console.log("[RazorpayCheckout] Raw booking.razorpay_order_id value:", booking.razorpay_order_id);
      console.log("[RazorpayCheckout] Raw depositAmount (rupees):", depositAmount, "→ paise:", Math.round(depositAmount * 100));
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay open error:", err);
      setError("Failed to launch payment widget. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-flora-line bg-flora-ivory shadow-lift">
        {/* Header */}
        <div className="border-b border-flora-line bg-flora-navy px-8 py-8 text-center text-flora-ivory">
          <p className="eyebrow text-flora-gold">Flora · Firenze</p>
          <h1 className="display-title mt-2 text-[clamp(2rem,4vw,2.8rem)] font-normal text-flora-cream">
            {paymentStatus === "deposit_paid"
              ? "Deposit Confirmed"
              : "Secure Deposit Payment"}
          </h1>
          <p className="mt-2 font-sans text-xs tracking-wider text-flora-blush/90 uppercase">
            Palazzo Storico · Florence, Italy
          </p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10">
          {paymentStatus === "deposit_paid" ? (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="flex items-center gap-3 rounded-lg border border-flora-sage bg-flora-sage/30 px-5 py-4 text-flora-navy">
                <span className="flex size-7 items-center justify-center rounded-full bg-flora-navy text-sm text-flora-ivory">
                  ✓
                </span>
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-flora-navy">
                    25% Deposit Received · Reservation Fully Secured
                  </p>
                  <p className="mt-0.5 text-sm text-flora-slate">
                    A formal payment receipt has been dispatched to {booking.guest_email}.
                  </p>
                </div>
              </div>

              {/* Reservation summary details */}
              <div className="rounded-xl border border-flora-line/80 bg-flora-cream/50 p-6">
                <p className="eyebrow text-flora-gold">Stay Summary</p>
                <dl className="mt-4 divide-y divide-flora-line/70 font-sans text-sm">
                  <div className="flex justify-between py-2.5">
                    <dt className="text-flora-grey">Reservation Ref</dt>
                    <dd className="font-mono text-xs font-bold text-flora-navy">{booking.id}</dd>
                  </div>
                  {paymentId && (
                    <div className="flex justify-between py-2.5">
                      <dt className="text-flora-grey">Payment Ref</dt>
                      <dd className="font-mono text-xs text-flora-slate">{paymentId}</dd>
                    </div>
                  )}
                  <div className="flex justify-between py-2.5">
                    <dt className="text-flora-grey">Guest Name</dt>
                    <dd className="font-medium text-flora-charcoal">{booking.guest_name}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-flora-grey">Suite & Rate</dt>
                    <dd className="font-medium text-flora-charcoal">{roomName} · {rateName}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-flora-grey">Dates</dt>
                    <dd className="text-flora-charcoal">
                      {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-flora-grey">Deposit Paid</dt>
                    <dd className="font-display text-lg font-bold text-flora-navy">
                      {formatMoney(depositAmount, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5 text-flora-slate">
                    <dt className="font-medium">Balance Payable at Check-in</dt>
                    <dd className="font-display text-lg font-bold text-flora-terracotta">
                      {formatMoney(remainingBalance, currency)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/"
                  className="luxury-button inline-block border-flora-navy bg-flora-navy px-8 py-3 text-flora-ivory [--button-fill:var(--flora-slate)] [--button-ink:var(--flora-ivory-card)]"
                >
                  Return to Flora
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Introduction */}
              <p className="text-base leading-relaxed text-flora-charcoal">
                Dear <strong className="text-flora-navy">{booking.guest_name}</strong>, your reservation at Flora Palazzo is confirmed. Please complete the initial 25% deposit below to secure your suite.
              </p>

              {/* Reservation & Breakdown Card */}
              <div className="rounded-xl border border-flora-line bg-flora-cream/60 p-6">
                <p className="eyebrow text-flora-gold">Stay Details</p>
                <div className="mt-3">
                  <h2 className="font-display text-2xl text-flora-navy">{roomName}</h2>
                  <p className="mt-1 font-sans text-xs uppercase tracking-wider text-flora-grey">
                    {rateName} · {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ""}
                  </p>
                  <p className="mt-2 text-sm text-flora-charcoal">
                    {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
                  </p>
                </div>

                <div className="mt-6 border-t border-flora-line pt-4">
                  <p className="eyebrow text-flora-grey">Payment Breakdown</p>
                  <dl className="mt-3 space-y-2.5 font-sans text-sm">
                    <div className="flex justify-between">
                      <dt className="text-flora-grey">Total Stay Price</dt>
                      <dd className="font-medium text-flora-charcoal">{formatMoney(totalPrice, currency)}</dd>
                    </div>
                    <div className="flex justify-between text-flora-navy">
                      <dt className="font-semibold uppercase tracking-wider text-xs">
                        Deposit Due Now (25%)
                      </dt>
                      <dd className="font-display text-xl font-bold text-flora-navy">
                        {formatMoney(depositAmount, currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-flora-line pt-2 text-xs text-flora-grey">
                      <dt>Remaining Balance (Payable at Hotel)</dt>
                      <dd className="font-medium text-flora-slate">{formatMoney(remainingBalance, currency)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-flora-rose/40 bg-flora-blush/50 p-4 text-sm text-flora-terracotta">
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePayDeposit}
                  disabled={isProcessing}
                  className="luxury-button flex w-full items-center justify-center border-flora-navy bg-flora-navy py-4 text-center text-sm uppercase tracking-[0.18em] text-flora-ivory transition-all [--button-fill:var(--flora-slate)] [--button-ink:var(--flora-ivory-card)] hover:shadow-lift disabled:opacity-50"
                >
                  {isProcessing
                    ? "Processing Payment…"
                    : `Pay Deposit · ${formatMoney(depositAmount, currency)}`}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 font-sans text-[0.65rem] tracking-wider text-flora-grey uppercase">
                  <span>🔒 256-Bit Encrypted Razorpay Checkout</span>
                  <span>·</span>
                  <span>Test Mode</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

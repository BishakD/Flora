import crypto from "crypto";

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
  notes?: Record<string, string>;
}

/**
 * Creates a Razorpay Order in INR for the given amount (in paise).
 */
export async function createRazorpayOrder({
  amountInPaise,
  receipt,
  notes = {},
}: {
  amountInPaise: number;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables.");
  }

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amountInPaise),
      currency: "INR",
      receipt: receipt?.slice(0, 40),
      notes,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[Razorpay Order API Error]:", res.status, data);
    throw new Error(data?.error?.description || "Failed to create Razorpay Order");
  }

  return data as RazorpayOrderResult;
}

/**
 * Verifies the signature returned by Checkout.js handler on payment success.
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keySecret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies the signature header sent with Razorpay Webhook events.
 */
export function verifyRazorpayWebhookSignature({
  bodyText,
  signature,
  secret,
}: {
  bodyText: string;
  signature: string;
  secret: string;
}): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(bodyText)
    .digest("hex");

  return expectedSignature === signature;
}
export interface RazorpayRefundResult {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  speed_processed?: string;
}

/**
 * Issues a full or partial refund against a captured Razorpay payment.
 * amount must be in paise (e.g. ₹500 = 50000).
 */
export async function createRazorpayRefund({
  paymentId,
  amountInPaise,
  notes = {},
}: {
  paymentId: string;
  amountInPaise: number;
  notes?: Record<string, string>;
}): Promise<RazorpayRefundResult> {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables.");
  }

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amountInPaise),
      notes,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[Razorpay Refund API Error]:", res.status, JSON.stringify(data));
    throw new Error(data?.error?.description || `Razorpay refund failed (HTTP ${res.status})`);
  }

  return data as RazorpayRefundResult;
}

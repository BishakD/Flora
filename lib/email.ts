import nodemailer from "nodemailer";

export interface BookingEmailData {
  bookingId: string;
  bookingReference?: string | null;
  guestName: string;
  guestEmail: string;
  roomName: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  currency?: string;
  depositAmount?: number;
  remainingBalance?: number;
  paymentUrl?: string;
  razorpayPaymentId?: string;
}

export function formatMoney(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
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

function calculateNights(checkIn: string, checkOut: string): number {
  try {
    const [y1, m1, d1] = checkIn.split("-").map(Number);
    const [y2, m2, d2] = checkOut.split("-").map(Number);
    const startUtc = Date.UTC(y1, m1 - 1, d1);
    const endUtc = Date.UTC(y2, m2 - 1, d2);
    return Math.max(1, Math.round((endUtc - startUtc) / 86_400_000));
  } catch {
    return 1;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Builders
// ─────────────────────────────────────────────────────────────────────────────

function emailWrapper({
  headline,
  statusBadge,
  messageIntro,
  detailsHtml,
  callToActionHtml = "",
  afterNoteHtml = "",
  summaryTitle = "Reservation Summary",
  footerSignature = "The Reservations Team · Flora Palazzo",
}: {
  headline: string;
  statusBadge: string;
  messageIntro: string;
  detailsHtml: string;
  callToActionHtml?: string;
  afterNoteHtml?: string;
  summaryTitle?: string;
  footerSignature?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} · Flora Palazzo</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f1e7;font-family:Georgia,serif;color:#2a2a28;line-height:1.6;-webkit-text-size-adjust:100%;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f6f1e7;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#fdfbf6;border:1px solid #dcd3c4;border-radius:4px;box-shadow:0 4px 20px rgba(43,32,22,0.06);overflow:hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color:#1b2a3f;padding:36px 24px 28px 24px;border-bottom:3px solid #c6a15b;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.25em;color:#c6a15b;text-transform:uppercase;font-weight:600;">Firenze</p>
              <h1 style="margin:8px 0 0 0;font-family:Georgia,serif;font-size:32px;letter-spacing:0.08em;color:#fdfbf6;text-transform:uppercase;font-weight:normal;">Flora</h1>
              <p style="margin:4px 0 0 0;font-family:Georgia,serif;font-style:italic;font-size:14px;color:#ead3cd;">Boutique Palazzo Hotel</p>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding:36px 32px 24px 32px;">
              <div style="margin-bottom:16px;">
                ${statusBadge}
              </div>

              <h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:24px;color:#1b2a3f;font-weight:normal;line-height:1.2;">
                ${headline}
              </h2>

              <p style="margin:0 0 24px 0;font-family:Georgia,serif;font-size:15px;color:#2a2a28;line-height:1.6;">
                ${messageIntro}
              </p>

              <!-- Reservation Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f6f1e7;border:1px solid #dcd3c4;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#c6a15b;text-transform:uppercase;">${summaryTitle}</p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${detailsHtml}
                    </table>
                  </td>
                </tr>
              </table>

              ${callToActionHtml}

              ${afterNoteHtml}

              <p style="margin:24px 0 0 0;font-family:Georgia,serif;font-size:14px;color:#6b6660;line-height:1.6;">
                Warm regards,<br>
                <em style="color:#1b2a3f;">${footerSignature}</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#2b2016;padding:24px 24px;border-top:1px solid #dcd3c4;">
              <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.18em;color:#fdfbf6;text-transform:uppercase;">
                Flora · Palazzo Storico · Firenze
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#d9afa8;letter-spacing:0.05em;">
                This is an automated reservation communication from Flora.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCommonDetailsRows(data: BookingEmailData): string {
  const nights = calculateNights(data.checkIn, data.checkOut);
  const checkInFormatted = formatDate(data.checkIn);
  const checkOutFormatted = formatDate(data.checkOut);

  return `
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;" width="40%">Booking Reference</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:20px;color:#1b2a3f;font-weight:bold;letter-spacing:0.15em;" align="right">${data.bookingReference || data.bookingId.toUpperCase().slice(0, 6)}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Guest Name</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;" align="right">${data.guestName}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Room Type</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;" align="right">${data.roomName}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Rate Plan</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:#6b6660;" align="right">${data.rateName}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;border-top:1px solid #dcd3c4;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Check-in</td>
      <td style="padding:6px 0;border-top:1px solid #dcd3c4;font-family:Georgia,serif;font-size:14px;color:#1b2a3f;" align="right">${checkInFormatted}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Check-out</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:#1b2a3f;" align="right">${checkOutFormatted}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Guests</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:#1b2a3f;" align="right">${data.adults} Adults${data.children > 0 ? `, ${data.children} Children` : ""} (${nights} ${nights === 1 ? "night" : "nights"})</td>
    </tr>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Dispatcher (Supports Gmail SMTP / Nodemailer & Resend API)
// ─────────────────────────────────────────────────────────────────────────────

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const smtpEmail = process.env.SMTP_EMAIL?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();

  // 1. If SMTP credentials (e.g. Gmail) are provided, route via Nodemailer
  // This allows sending test/production emails to ANY email address / phone
  if (smtpEmail && smtpPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpEmail,
          pass: smtpPassword.replace(/\s+/g, ""), // clean any spaces from Google App Password
        },
      });

      const info = await transporter.sendMail({
        from: `Flora Palazzo <${smtpEmail}>`,
        to,
        subject,
        html,
      });

      console.log(
        `[Email / SMTP] Email dispatched successfully (${info.messageId}) to ${to}`,
      );
      return { success: true, id: info.messageId };
    } catch (smtpErr: any) {
      console.error(
        "[Email / SMTP] Error dispatching email via Gmail SMTP:",
        smtpErr,
      );
      return { success: false, error: smtpErr?.message || String(smtpErr) };
    }
  }

  // 2. Otherwise, fall back to Resend API
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[Email] Neither SMTP credentials nor RESEND_API_KEY are configured. Email will not be sent.",
    );
    return { success: false, error: "No email credentials configured" };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Flora Palazzo <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      console.error("[Resend] API Error:", res.status, body);
      return { success: false, error: body?.message || "Failed to send email" };
    }

    console.log(`[Resend] Email sent successfully (${body.id}) to ${to}`);
    return { success: true, id: body.id };
  } catch (err) {
    console.error("[Resend] Network/Execution Error:", err);
    return { success: false, error: String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Email Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. "BOOKING RECEIVED" email — sent when guest submits a reservation request.
 * @deprecated No longer called in the direct checkout flow. Kept for legacy compatibility.
 */
export async function sendBookingReceivedEmail(
  data: BookingEmailData,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const formattedTotal = formatMoney(data.totalPrice, data.currency);
  const detailsHtml = `
    ${buildCommonDetailsRows(data)}
    <tr>
      <td style="padding:10px 0 4px 0;border-top:1px dashed #c6a15b;font-family:Arial,sans-serif;font-size:12px;color:#1b2a3f;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Total Amount</td>
      <td style="padding:10px 0 4px 0;border-top:1px dashed #c6a15b;font-family:Georgia,serif;font-size:20px;color:#1b2a3f;font-weight:bold;" align="right">${formattedTotal}</td>
    </tr>`;

  const html = emailWrapper({
    headline: "Reservation request received",
    statusBadge: `<span style="display:inline-block;padding:4px 12px;background-color:#ead3cd;color:#2b2016;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #d9afa8;">Pending Review</span>`,
    messageIntro: `Dear ${data.guestName},<br><br>Thank you for choosing Flora Palazzo. We have received your reservation request for your upcoming stay in Florence. Our reservations team is reviewing your stay details and will confirm shortly.`,
    detailsHtml,
    afterNoteHtml: `<p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:14px;color:#6b6660;line-height:1.6;">Our concierge team is at your disposal for bespoke dining reservations, private gallery viewings, and tailor-made Florentine itineraries.</p>`,
  });

  return sendEmail({
    to: data.guestEmail,
    subject: `Reservation Request Received · Flora Palazzo (${data.roomName})`,
    html,
  });
}

/**
 * 2. "BOOKING CONFIRMED" email — sent exactly once, immediately after deposit payment is captured.
 *    Includes: booking reference, payment reference, room, dates, total, deposit paid, balance at check-in.
 *    This is the ONLY confirmation email in the direct guest checkout flow.
 */
export async function sendBookingConfirmedEmail(
  data: BookingEmailData,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const deposit =
    data.depositAmount ?? Math.round(data.totalPrice * 0.25 * 100) / 100;
  const balance =
    data.remainingBalance ?? Math.max(0, data.totalPrice - deposit);

  const formattedTotal = formatMoney(data.totalPrice, data.currency);
  const formattedDeposit = formatMoney(deposit, data.currency);
  const formattedBalance = formatMoney(balance, data.currency);

  const detailsHtml = `
    ${buildCommonDetailsRows(data)}
    ${
      data.razorpayPaymentId
        ? `<tr>
            <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Payment Ref</td>
            <td style="padding:6px 0;font-family:Georgia,serif;font-size:13px;color:#1b2a3f;" align="right">${data.razorpayPaymentId}</td>
          </tr>`
        : ""
    }
    <tr>
      <td style="padding:8px 0 4px 0;border-top:1px solid #dcd3c4;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Total Stay Amount</td>
      <td style="padding:8px 0 4px 0;border-top:1px solid #dcd3c4;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;" align="right">${formattedTotal}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;color:#3f5064;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Deposit Paid (25%)</td>
      <td style="padding:4px 0;font-family:Georgia,serif;font-size:16px;color:#1b2a3f;font-weight:bold;" align="right">${formattedDeposit}</td>
    </tr>
    <tr>
      <td style="padding:6px 0 8px 0;border-top:1px dashed #c6a15b;font-family:Arial,sans-serif;font-size:12px;color:#c6a15b;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Balance Due at Check-in</td>
      <td style="padding:6px 0 8px 0;border-top:1px dashed #c6a15b;font-family:Georgia,serif;font-size:18px;color:#c6a15b;font-weight:bold;" align="right">${formattedBalance}</td>
    </tr>`;

  const afterNoteHtml = `
    <div style="margin:24px 0;padding:16px 20px;background-color:#d4d9d1;border-radius:4px;border-left:4px solid #1b2a3f;">
      <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#1b2a3f;line-height:1.5;">
        <strong>Deposit Confirmed:</strong> Your deposit of ${formattedDeposit} has been successfully received. The remaining balance of ${formattedBalance} will be settled upon check-in at Flora Palazzo.
      </p>
    </div>
    <p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:14px;color:#6b6660;line-height:1.6;">
      <strong>Arrival Information:</strong> Check-in commences from 3:00 PM and check-out is at 11:00 AM. Should you require private chauffeur transfer from Firenze Santa Maria Novella station or Amerigo Vespucci Airport, our concierge will be delighted to coordinate your arrival.
    </p>`;

  const html = emailWrapper({
    headline: "Your reservation is confirmed",
    statusBadge: `<span style="display:inline-block;padding:4px 12px;background-color:#d4d9d1;color:#1b2a3f;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #c0c7bc;">Confirmed · Deposit Paid</span>`,
    messageIntro: `Dear ${data.guestName},<br><br>Thank you. Your reservation at Flora Palazzo is confirmed and your 25% deposit of ${formattedDeposit} has been received. We look forward to welcoming you to Florence.`,
    detailsHtml,
    afterNoteHtml,
  });

  return sendEmail({
    to: data.guestEmail,
    subject: `Reservation Confirmed · Flora Palazzo (${data.roomName})`,
    html,
  });
}

/**
 * 3. "PAYMENT RECEIVED" email.
 * @deprecated Delegates to sendBookingConfirmedEmail. Kept so existing call-sites compile cleanly.
 */
export async function sendPaymentReceivedEmail(
  data: BookingEmailData,
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendBookingConfirmedEmail(data);
}

/**
 * 4. "BOOKING CANCELLED" email — sent when admin cancels a booking.
 *    If refundAmount is provided, includes refund confirmation language.
 *    If not, only confirms the cancellation with no refund language.
 */
export async function sendBookingCancelledEmail(
  data: BookingEmailData & { refundAmount?: number; refundId?: string },
): Promise<{ success: boolean; id?: string; error?: string }> {
  const currency = data.currency || "INR";
  const hasRefund =
    typeof data.refundAmount === "number" && data.refundAmount > 0;
  const formattedRefund = hasRefund
    ? formatMoney(data.refundAmount!, currency)
    : "";

  const refundRow = hasRefund
    ? `<tr>
        <td style="padding:8px 0 4px 0;border-top:1px solid #dcd3c4;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Deposit Refunded</td>
        <td style="padding:8px 0 4px 0;border-top:1px solid #dcd3c4;font-family:Georgia,serif;font-size:16px;color:#1b2a3f;font-weight:bold;" align="right">${formattedRefund}</td>
      </tr>${
        data.refundId
          ? `<tr>
              <td style="padding:4px 0 8px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Refund Reference</td>
              <td style="padding:4px 0 8px 0;font-family:Georgia,serif;font-size:13px;color:#6b6660;" align="right">${data.refundId}</td>
            </tr>`
          : ""
      }`
    : "";

  const detailsHtml = `
    ${buildCommonDetailsRows(data)}
    <tr>
      <td style="padding:8px 0 4px 0;border-top:1px solid #dcd3c4;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Total Stay Amount</td>
      <td style="padding:8px 0 4px 0;border-top:1px solid #dcd3c4;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;" align="right">${formatMoney(data.totalPrice, currency)}</td>
    </tr>
    ${refundRow}`;

  const refundNoteHtml = hasRefund
    ? `<div style="margin:24px 0;padding:16px 20px;background-color:#f6f1e7;border-radius:4px;border-left:4px solid #c6a15b;">
        <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#1b2a3f;line-height:1.5;">
          <strong>Deposit Refund:</strong> Your deposit of ${formattedRefund} has been submitted for refund. Refunds typically appear in your original payment method within <strong>5–7 business days</strong>, depending on your bank.
        </p>
      </div>
      <p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:14px;color:#6b6660;line-height:1.6;">
        If you have not received your refund after 7 business days, please contact us with your refund reference number above and we will follow up with our payments team.
      </p>`
    : `<p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:14px;color:#6b6660;line-height:1.6;">
        No payment was collected for this reservation, so no refund is necessary. We hope to welcome you to Flora Palazzo on a future occasion.
      </p>`;

  const intro = hasRefund
    ? `Dear ${data.guestName},<br><br>We regret to inform you that your reservation at Flora Palazzo has been cancelled. Your deposit of ${formattedRefund} will be refunded to your original payment method within 5–7 business days.`
    : `Dear ${data.guestName},<br><br>Your reservation at Flora Palazzo has been cancelled. We hope to welcome you to Florence on a future occasion.`;

  const html = emailWrapper({
    headline: "Reservation cancelled",
    statusBadge: `<span style="display:inline-block;padding:4px 12px;background-color:#ead3cd;color:#2b2016;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #d9afa8;">Cancelled${hasRefund ? " · Refund Initiated" : ""}</span>`,
    messageIntro: intro,
    detailsHtml,
    afterNoteHtml: refundNoteHtml,
  });

  return sendEmail({
    to: data.guestEmail,
    subject: `Reservation Cancelled · Flora Palazzo (${data.roomName})`,
    html,
  });
}

/**
 * Staff Welcome Email
 */
export async function sendStaffWelcomeEmail(data: {
  staffEmail: string;
  staffName: string;
  role: "admin" | "reception";
}) {
  const loginUrl = "https://flora.ferenc.com/staff/login";

  const detailsHtml = `
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;" width="40%">Name</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;letter-spacing:0.15em;" align="right">${data.staffName}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Role</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;text-transform:capitalize;" align="right">${data.role}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Login Portal</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:#c6a15b;" align="right"><a href="${loginUrl}" style="color:#c6a15b;text-decoration:none;">Sign In Here</a></td>
    </tr>
  `;

  const html = emailWrapper({
    headline: "Welcome to the Flora Team",
    statusBadge: `<span style="display:inline-block;padding:4px 12px;background-color:#d4e5d7;color:#1b2a3f;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #b8ccbe;">Account Active</span>`,
    messageIntro: `Dear ${data.staffName},<br><br>Welcome to Flora Palazzo! Your staff account has been successfully created. You can now log in to the staff portal using your email address and the password you set.`,
    detailsHtml,
    summaryTitle: "Account Details",
    footerSignature: "Management · Flora Palazzo",
    callToActionHtml: `
      <div style="margin:32px 0;text-align:center;">
        <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background-color:#1b2a3f;color:#fdfbf6;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;border-radius:4px;">Log in to Portal</a>
      </div>
    `,
  });

  return sendEmail({
    to: data.staffEmail,
    subject: "Welcome to the Flora Team",
    html,
  });
}

/**
 * Staff Removal Email
 */
export async function sendStaffRemovalEmail(data: {
  staffEmail: string;
  staffName: string;
}) {
  const html = emailWrapper({
    headline: "Staff Access Revoked",
    statusBadge: `<span style="display:inline-block;padding:4px 12px;background-color:#ead3cd;color:#2b2016;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #d9afa8;">Access Removed</span>`,
    messageIntro: `Dear ${data.staffName},<br><br>This is to confirm that your staff access to the Flora Palazzo management system has been successfully revoked. You will no longer be able to sign in to the portal.`,
    summaryTitle: "Account Status",
    footerSignature: "Management · Flora Palazzo",
    detailsHtml: `
      <tr>
        <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;" width="40%">Status</td>
        <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;letter-spacing:0.15em;" align="right">Closed</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Action</td>
        <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;" align="right">Access Revoked</td>
      </tr>
    `,
  });

  return sendEmail({
    to: data.staffEmail,
    subject: "Update to your Flora Account Access",
    html,
  });
}
